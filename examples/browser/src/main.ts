import {InfluxDBClient, Point} from '@influxdata/influxdb3-client-browser'

import * as view from './view'

/*********** initial values ***********/

view.generateWriteInput()

const INITIAL_QUERY = `\
SELECT *
  FROM "stat"
WHERE
    time >= now() - interval '5 minute'
  AND
    "unit" IN ('temperature')
`

view.setQuery(INITIAL_QUERY)

/*********** helper functions ***********/

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const getTableHeaders = (values: Record<string, any>): string[] =>
  Object.entries(values)
    .filter((x) => x[1])
    .map((x) => x[0])

const getRowValues = (headers: string[], values: Record<string, any>): any[] =>
  headers.map((x) => JSON.stringify(values[x]))

/*********** Influxdb client setup ***********/

const database = import.meta.env.VITE_INFLUXDB_DATABASE
const token = import.meta.env.VITE_INFLUXDB_TOKEN
const host = '/influx' // vite proxy

const queryType = 'sql'

const client = new InfluxDBClient({host, token})

/*********** Influxdb write ***********/

view.setOnRandomize(()=>{
  view.generateWriteInput()
})

view.setOnWrite(async () => {
  const data = view.getWriteInput()
  const p = new Point('stat')
    .tag('Source', data['Source'])
    .floatField('Temperature', data['Temperature'])
    .floatField('Humidity', data['Humidity'])
    .floatField('Pressure', data['Pressure'])
    .intField('CO2', data['CO2'])
    .intField('TVOC', data['TVOC'])
    .timestamp(new Date())

  try {
    view.setWriteInfo('writing')
    await client.write(p, database)
    view.setWriteInfo('success')
  } catch (e: any) {
    view.setWriteInfo(e?.message ?? e?.toString?.() ?? "error! more info in console")
    throw e
  }
})

/*********** Influxdb query ***********/

view.setOnQuery(async () => {
  const query = view.getQuery()
  const queryResult = client.query(query, database, queryType)

  const firstRow = (await queryResult.next()).value
  if (firstRow) {
    const headers = getTableHeaders(firstRow)
    const getValues = getRowValues.bind(undefined, headers)

    view.createTable(headers)
    view.pushTableRow(getValues(firstRow))

    for await (const row of queryResult) {
      await sleep(50) // simulate throttling
      view.pushTableRow(getValues(row))
    }
  }
})
