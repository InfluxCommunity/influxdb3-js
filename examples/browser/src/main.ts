import {InfluxDBClient, Point} from '@influxdata/influxdb3-client-browser'

import * as view from './view'
import { EXAMPLE_QUERIES } from "./exampleQueries";

/*********** initial values ***********/

view.generateWriteInput()

view.setSelectQueryOptions(EXAMPLE_QUERIES.map(x=>x.name))
view.onSelectQueryOption((exampleQueryName) => {
  const {desc, query} = EXAMPLE_QUERIES.find(x=>x.name === exampleQueryName)!;
  view.setQueryDesc(desc)
  view.setQuery(query)
})
view.selectQueryOption(EXAMPLE_QUERIES[0].name)

/*********** helper functions ***********/

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const getTableHeaders = (values: Record<string, any>): string[] =>
  Object.entries(values)
    .filter((x) => x[1])
    .map((x) => x[0])

const getRowValues = (headers: string[], values: Record<string, any>): any[] =>
  headers.map((x) =>
    JSON.stringify(values[x], (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    )
  )

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
    .tag('Device', data['Device'])
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

  try {
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
  }catch(e: any) {
    view.createTable(["error"])
    view.pushTableRow([e?.message ?? e?.toString?.() ?? "error! more info in console"])
    throw e
  }
})
