const queryResultElement = document.querySelector('#queryResult')!

/** helper function to easier manipulate DOM */
const el = <K extends keyof HTMLElementTagNameMap>(
  tag: K,
  children?: string | HTMLElement | HTMLElement[]
): HTMLElementTagNameMap[K] => {
  const element: HTMLElementTagNameMap[K] = document.createElement(tag)
  if (children)
    if (typeof children === 'string') {
      element.innerText = children
    } else if (Array.isArray(children)) {
      children.forEach((c) => element.appendChild(c))
    } else {
      element.appendChild(children)
    }
  return element
}

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
  Source: string
  Temperature: number
  Humidity: number
  Pressure: number
  CO2: number
  TVOC: number
};

const writeInputElements = Array.from(document.querySelectorAll("#writeInputsRow input")) as HTMLInputElement[];

export const getWriteInput = (): WriteData => {
  const res = {} as WriteData;
  for (const input of writeInputElements) {
    const name = input.id as keyof WriteData;
    const value = input.value;

    if (name === "Source") {
      res[name] = value;
    } else {
      res[name] = parseFloat(value);
    }
  }

  return res;
};

const DAY_MILLIS = 24 * 60 * 60 * 1000

/**
 * Generates measurement values for a specific time.
 * @see {@link https://github.com/bonitoo-io/iot-center-v2}
 */
const generateValue = (period: number, min: number, max: number, time: number): number => {
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

const generateData = (time: number): WriteData =>
  ({
    "Source": "browser-example",
    "Temperature": generateValue(30, 0, 40, time),
    "Humidity": generateValue(90, 0, 99, time),
    "Pressure": generateValue(20, 970, 1050, time),
    "CO2": Math.trunc(generateValue(1, 400, 3000, time)),
    "TVOC": Math.trunc(generateValue(1, 250, 2000, time)),
  })
;

export const generateWriteInput = (time?: number): void => {
  const data = generateData(time ?? Date.now())

  for (const input of writeInputElements) {
    const name = input.id as keyof WriteData;
    input.value = data[name].toString();
  }
}

/*********** query ***********/

const queryElement: HTMLTextAreaElement = document.querySelector('#query')!
const queryButton: HTMLButtonElement = document.querySelector('#queryButton')!

export const setQuery = (query: string) => {
  queryElement.value = query
}

export const getQuery = (): string => queryElement.value

export const setOnQuery = (callback: () => void) => {
  queryButton.addEventListener('click', callback)
}

/*********** query result table ***********/

let tableBody: HTMLTableSectionElement | undefined

export const cleanTable = () => {
  queryResultElement.innerHTML = ''
  tableBody = undefined
}

export const createTable = (headers: string[]) => {
  cleanTable()

  const tableHead = el(
    'thead',
    el(
      'tr',
      headers.map((header) => el('th', header))
    )
  )

  tableBody = el('tbody')

  const table = el('table', [tableHead, tableBody])

  queryResultElement.appendChild(table)
}

export const pushTableRow = (row: string[]) => {
  if (!tableBody) throw Error('create table first!')
  tableBody.appendChild(
    el(
      'tr',
      row.map((value) => el('td', value))
    )
  )
}
