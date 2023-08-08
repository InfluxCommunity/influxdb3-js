
type ExampleQuery = {
  name: string,
  query: string,
  desc: string,
}

export const EXAMPLE_QUERIES: ExampleQuery[] = [
  {
    name: "Raw",
    query: `\
SELECT 
  "Temperature", "Humidity", "time"
FROM "stat"
WHERE
  time >= now() - interval '1 hour'`,
    desc: `\
basic query returning data as is
from past 1 hour
showing fields:
  "Temperature", "Humidity", "time"
`
  },
  {
    name: `Aggregate`,
    desc: `\
Analyze CO2 levels
from past 1 hour
calculate:
  average, min, max for "CO2"`, 
    query: `\
SELECT 
  MIN("CO2") as minCO2, AVG("CO2") as avgCO2, MAX("CO2") as maxCO2
FROM "stat"
WHERE
  time >= now() - interval '1 hour';`,
  },
  {
    name: `Group`,
    desc: `\
Analyze average Temperature
per device
from past 1 hour
and sort by it`, 
    query: `\
SELECT 
  "Device", AVG("Temperature") as avgTemperature
FROM "stat"
WHERE
  time >= now() - interval '1 hour'
GROUP BY "Device"
ORDER BY avgTemperature;`,
  },
  {
    name: `Window`,
    desc: `\
Split data into 
5 minute windows 
for each window calculate 
  average Humidity`, 
    query: `\
SELECT
  date_bin('5 minutes', "time") as window_start,
  AVG("Humidity") as avgHumidity
FROM "stat"
WHERE
  "time" >= now() - interval '1 hour'
GROUP BY window_start
ORDER BY window_start DESC;`,
  },
  {
    name: `Correlation`,
    desc: `\
Analyze dependency between 
  "Humidity" and "Temperature" 
for each device
from past 1 hour`, 
    query: `\
SELECT 
  "Device",
  CORR("Humidity", "Temperature") AS correlation
FROM "stat"
WHERE
  time >= now() - interval '1 hour'
GROUP BY "Device";`,
  },
]


