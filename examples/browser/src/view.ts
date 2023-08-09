/*********** write ***********/

const writeButtonElement: HTMLButtonElement =
  document.querySelector('#writeButton')!

export const setOnWrite = (callback: () => void) => {
  writeButtonElement.addEventListener('click', callback)
}

const randomizeButtonElement: HTMLButtonElement =
  document.querySelector('#randomizeButton')!

export const setOnRandomize = (callback: () => void) => {
  randomizeButtonElement.addEventListener('click', callback)
}

const writeInfoElement: HTMLSpanElement = document.querySelector('#writeInfo')!

export const setWriteInfo = (message: string) =>
  (writeInfoElement.textContent = message)

/*********** WriteData ***********/

export type WriteData = {
  Device: string
  Temperature: number
  Humidity: number
  Pressure: number
  CO2: number
  TVOC: number
}

const writeInputElements = Array.from(
  document.querySelectorAll('#writeInputsRow input')
) as HTMLInputElement[]

export const getWriteInput = (): WriteData => {
  const res = {} as WriteData
  for (const input of writeInputElements) {
    const name = input.id as keyof WriteData
    const value = input.value

    if (name === 'Device') {
      res[name] = value
    } else {
      res[name] = parseFloat(value)
    }
  }

  return res
}

const DAY_MILLIS = 24 * 60 * 60 * 1000

/**
 * Generates measurement values for a specific time.
 * @see {@link https://github.com/bonitoo-io/iot-center-v2}
 */
const generateValue = (
  period: number,
  min: number,
  max: number,
  time: number
): number => {
  const dif = max - min
  const periodValue =
    (dif / 4) *
    Math.sin((((time / DAY_MILLIS) % period) / period) * 2 * Math.PI)
  const dayValue =
    (dif / 4) *
    Math.sin(((time % DAY_MILLIS) / DAY_MILLIS) * 2 * Math.PI - Math.PI / 2)
  return (
    Math.trunc((min + dif / 2 + periodValue + dayValue + Math.random()) * 10) /
    10
  )
}

const getRandomChar = (value: number, letters: number) =>
  String.fromCharCode(65 + Math.floor(value % letters))

const generateData = (time: number): WriteData => ({
  Device: `browser-${getRandomChar(time, 7)}`,
  Temperature: generateValue(30, 0, 40, time),
  Humidity: generateValue(90, 0, 99, time),
  Pressure: generateValue(20, 970, 1050, time),
  CO2: Math.trunc(generateValue(1, 400, 3000, time)),
  TVOC: Math.trunc(generateValue(1, 250, 2000, time)),
})
export const generateWriteInput = (time?: number): void => {
  const data = generateData((time ?? Date.now()) * 10_000)

  for (const input of writeInputElements) {
    const name = input.id as keyof WriteData
    input.value = data[name].toString()
  }
}

/*********** query ***********/

const queryElement: HTMLTextAreaElement = document.querySelector('#query')!
const queryButtonElement: HTMLButtonElement =
  document.querySelector('#queryButton')!
const querySelectElement: HTMLSelectElement =
  document.querySelector('#querySelect')!
const queryDescElement: HTMLTextAreaElement =
  document.querySelector('#queryDesc')!

export const selectQueryOption = (option: string) => {
  querySelectElement.value = option
  const e = new Event('change')
  querySelectElement.dispatchEvent(e)
}

export const setSelectQueryOptions = (options: string[]) => {
  for (const option of options) {
    const optionElement = document.createElement('option')
    optionElement.value = option
    optionElement.innerText = option
    querySelectElement.appendChild(optionElement)
  }
}

export const onSelectQueryOption = (callback: (value: string) => void) => {
  querySelectElement.addEventListener('change', (e) => {
    const selectedOption = (e.target as HTMLSelectElement).value
    callback(selectedOption)
  })
}

export const setQueryDesc = (desc: string) => {
  queryDescElement.value = desc
}

export const setQuery = (query: string) => {
  queryElement.value = query
}

export const getQuery = (): string => queryElement.value

export const setOnQuery = (callback: () => void) => {
  queryButtonElement.addEventListener('click', callback)
}

/*********** query result table ***********/

const queryResultElement = document.querySelector('#queryResult')!

let tableBody: HTMLTableSectionElement | undefined

export const cleanTable = () => {
  queryResultElement.innerHTML = ''
  tableBody = undefined
}

export const createTable = (headers: string[]) => {
  cleanTable()

  const tableHead = document.createElement('thead')
  const tableHeaderRow = document.createElement('tr')
  tableBody = document.createElement('tbody')

  for (const header of headers) {
    const headerElement = document.createElement('th')
    headerElement.innerText = header
    tableHeaderRow.appendChild(headerElement)
  }
  tableHead.appendChild(tableHeaderRow)

  const table = document.createElement('table')
  table.appendChild(tableHead)
  table.appendChild(tableBody)

  queryResultElement.appendChild(table)
}

export const pushTableRow = (row: string[]) => {
  if (!tableBody) throw Error('create table first!')
  const tableRow = document.createElement('tr')
  for (const value of row) {
    const cell = document.createElement('td')
    cell.innerHTML = value
    tableRow.appendChild(cell)
  }

  tableBody.appendChild(tableRow)
}
