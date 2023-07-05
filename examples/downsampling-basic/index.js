require('dotenv').config();
const { startOfHour, getUnixTime, roundToNearestMinutes, sub } = require('date-fns');
const { InfluxDBClient, Point } = require('@influxdata/influxdb3-client');

// ENV Variables
const host = process.env.INFLUXDB_URL;
const token = process.env.INFLUXDB_TOKEN;

// Downsampling variables
const databaseFrom = process.env.INFLUXDB_DATABASE_FROM;
const databaseTo = process.env.INFLUXDB_DATABASE_TO;
const measurementFrom = process.env.MEASUREMENT_FROM;
const measurementTo = process.env.MEASUREMENT_TO;
const downsampledRetentionPolicy = process.env.DOWNSAMPLED_RETENTION_POLICY;
const downsampledField = process.env.DOWNSAMPLED_FIELD;
const downsampledTag = process.env.DOWNSAMPLED_TAG;
const downsampleIntervalHours = process.env.DOWNSAMPLED_INTERVAL_HOURS; // e.g. "2 hours"

// Initialise InfluxDB Client 
const client = new InfluxDBClient({ host, token, writeOptions: { precision: 'ms' } });

// Query InfluxDB for the downsampled max, min, and avg data
async function readAndWriteQuery(startTime) {
  const downsampleQuery = `
    SELECT
      date_bin(interval '${downsampleIntervalHours}', time, ${startTime}::timestamp) AS time,
      "${downsampledTag}",
      selector_max("${downsampledField}", time)['value'] AS 'max',
      selector_min("${downsampledField}", time)['value'] AS 'min',
      avg("${downsampledField}") AS 'avg'
    FROM "${measurementFrom}"
    GROUP BY date_bin(interval '2 hours', time, ${startTime}::timestamp), ${downsampledTag}
    ORDER BY ${downsampledTag}, time
  `;
  const downsampledData = await client.query(downsampleQuery, databaseFrom);
  
  // Iterate through the async generator response and write a point for each object
  for await (const result of downsampledData) {
    const newMeasurement = new Point(measurementTo)
      .timestamp(result.time.toFixed(0))
      .tag(`${downsampledTag}`, result[downsampledTag])
      .floatField(`avg_${downsampledField}`, result.avg.toFixed(2))
      .floatField(`min_${downsampledField}`, result.min.toFixed(2))
      .floatField(`max_${downsampledField}`, result.max.toFixed(2));
    await client.write(newMeasurement, databaseTo);
    console.log(newMeasurement);
  }
}

// Define the downsampling task
async function runDownsamplingTask() {
  try {
    // Fetch the latest timestamp from the downsampled database
    const queryLatestTimestamp = `
      SELECT 
        selector_last("avg_${downsampledField}", time)['time'] AS time
      FROM "${measurementTo}"
    `;
    try {
      const latestTimestampResult = await client.query(queryLatestTimestamp, databaseTo);
      for await (const row of latestTimestampResult) {
        const startTime = getUnixTime(startOfHour(row.time));
        await readAndWriteQuery(startTime);
      }
    } catch (error) {
      // Handle the error, and use a fallback timestamp
      console.error('No Data in downsampled database, will fetch from the beginning of the Retention Period');
      const startTime = getUnixTime(startOfHour(sub(new Date(), { days: downsampledRetentionPolicy })));
      await readAndWriteQuery(startTime);
    }
    console.log('Downsampling task completed successfully.');
  } catch (error) {
    console.error('Error executing downsampling task:', error);
  }
  
  client.close();
}

// Run the downsampling task
runDownsamplingTask();