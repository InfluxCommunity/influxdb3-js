import {InfluxDBClient} from '../../src'
import { ClientOptions, createFlightSqlClient } from '@lakehouse-rs/flight-sql-client';
import {RecordBatchReader, tableFromIPC} from 'apache-arrow';

/*
const DB_HOST = process.env.HOST;
const DB_TOKEN = process.env.TOKEN;
const DB_DB = process.env.BUCKET_NAME;
*/
const DB_HOST = "https://us-east-1-1.aws.cloud2.influxdata.com";
const DB_TOKEN = "jGVT56tt_eeD7WDfh0y945R6r54k3XYmdLWLjJU0vpWsJbS7PqbwLFX58vfgucEOx5jr_B9v6Ap-myu4oVnirg==";
const DB_DB = "samans-bucket";

//query = `SELECT usage_user FROM "cpu_host_max" WHERE time > now() - interval '60 minute'`; //This takes ~0.26 seconds
//const queryShort = `SELECT * FROM win_cpu WHERE time > now() - interval '3 hours'`; //This takes 2+ seconds
const queryLong = `SELECT * FROM win_cpu WHERE time > now() - interval '2 days'`; //This takes 8+ seconds

describe('benchmark', () => {
    it('query data', async () => {
        // Create an instance of InfluxDB client
        const client = new InfluxDBClient({
            host: DB_HOST,
            token: DB_TOKEN,
            database: DB_DB
        });

        const run = async (query: string, limit: number) => {
            console.log(`running - ${query}`);

            let totalTime = 0;
            const arr = [];
            for (let i = 0; i < 5; i++) {
                const start = Date.now();
                try {
                    const result = await client.query(query);
                    //const result = await client.queryPoints(query);
                    console.log(`reading start`)
                    for await (const val of result) {
                        arr.push(val);
                    }
                } catch (error) {
                    console.error('Error executing query:', error);
                }

                //fs.writeFileSync('output.txt', JSON.stringify(arr));
                const end = Date.now();
                const elapsed = (end - start) / 1000;
                console.log(`iter: ${i} \t ${elapsed.toFixed(6)}s`);
                totalTime += elapsed;
            }
            console.log(`avg time: ${(totalTime / 5).toFixed(6)}s`);
        }
        var limit : number = 0;



        for (let n = 1; n <= 2; n += 500) {
            await run(queryLong, limit);
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
    }).timeout(300_000)
    it('query data Flight Recordbatchreader', async () => {
        const options: ClientOptions = {
            tls: true,
            //host: DB_HOST,
            host: "us-east-1-1.aws.cloud2.influxdata.com",
            port: 443,
            token: DB_TOKEN,
            headers: [{key: "database", value: DB_DB}],
        };
        console.log("creating client");
        const client = await createFlightSqlClient(options);
        //console.log("executing query");
        const runQuery = async (query: string) : Promise<Record<string, any>[]> => {
            //const start = Date.now();
            const buffer = await client.query(query);
            //const after = Date.now();
            //console.log("converting to table");
            const batches = await RecordBatchReader.from(buffer);
            var rows = [];
            for await (const batch of batches) {
                const row: Record<string, any> = {}
                for (const batchRow of batch) {
                    for (const column of batch.schema.fields) {
                        row[column.name] = batchRow[column.name]
                    }
                    rows.push(row);
                }
            }
            //const table = tableFromIPC(buffer);
            //const end = Date.now();
            //console.log(`query time: ${after - start}ms`);
            //console.log(`table time: ${end - after}ms`);
            return rows;
        }

        const run = async (query: string, limit: number) => {
            console.log(`running - ${query}`);

            let totalTime = 0;
            const arr = [];
            for (let i = 0; i < 5; i++) {
                const start = Date.now();
                try {
                    const result = await runQuery(query);
                    //const result = await client.queryPoints(query);
                    console.log(`reading start`)
                    for await (const val of result) {
                        arr.push(val);
                    }
                } catch (error) {
                    console.error('Error executing query:', error);
                }

                //fs.writeFileSync('output.txt', JSON.stringify(arr));
                const end = Date.now();
                const elapsed = (end - start) / 1000;
                console.log(`iter: ${i} \t ${elapsed.toFixed(6)}s`);
                totalTime += elapsed;
            }
            console.log(`avg time: ${(totalTime / 5).toFixed(6)}s`);
        }
        var limit : number = 0;
        for (let n = 1; n <= 2; n += 500) {
            await run(queryLong, limit);
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
        //console.log(table);
        //console.log(`rows:  ${rows.length}`);
    }).timeout(300_000)
    it('query data Flight tablefromIpc', async () => {
        const options: ClientOptions = {
            tls: true,
            //host: DB_HOST,
            host: "us-east-1-1.aws.cloud2.influxdata.com",
            port: 443,
            token: DB_TOKEN,
            headers: [{key: "database", value: DB_DB}],
        };
        console.log("creating client");
        const client = await createFlightSqlClient(options);
        // console.log("executing query");

        const runQuery = async (query: string) : Promise<Record<string, any>[]> => {
            // const start = Date.now();
            const buffer = await client.query(query);
            //const after = Date.now();
            //console.log("converting to table");
            const table = tableFromIPC(buffer);

            var rows = [];
            for (const batch of table.batches) {
                const row: Record<string, any> = {}
                for (const batchRow of batch) {
                    for (const column of batch.schema.fields) {
                        row[column.name] = batchRow[column.name]
                    }
                    rows.push(row);
                }
            }

            // const end = Date.now();
            // console.log(`query time: ${after - start}ms`);
            // console.log(`table time: ${end - after}ms`);
            // //console.log(table);
            // console.log(`table schema: ${table.schema}`);
            // console.log(`rows:  ${rows.length}`);
            return rows;
        }

        const run = async (query: string, limit: number) => {
            console.log(`running - ${query}`);

            let totalTime = 0;
            const arr = [];
            for (let i = 0; i < 5; i++) {
                const start = Date.now();
                try {
                    const result = await runQuery(query);
                    //const result = await client.queryPoints(query);
                    console.log(`reading start`)
                    for await (const val of result) {
                        arr.push(val);
                    }
                } catch (error) {
                    console.error('Error executing query:', error);
                }

                //fs.writeFileSync('output.txt', JSON.stringify(arr));
                const end = Date.now();
                const elapsed = (end - start) / 1000;
                console.log(`iter: ${i} \t ${elapsed.toFixed(6)}s`);
                totalTime += elapsed;
            }
            console.log(`avg time: ${(totalTime / 5).toFixed(6)}s`);
        }
        var limit : number = 0;
        for (let n = 1; n <= 2; n += 500) {
            await run(queryLong, limit);
            await new Promise((resolve) => setTimeout(resolve, 10000));
        }
    }).timeout(300_000)

})

describe('flight-sql-client', () => {

})
