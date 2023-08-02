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

const unitElement: HTMLInputElement = document.querySelector('#unit')!

export const setUnit = (unit: string) => {
  unitElement.value = unit
}

export const getUnit = (): string => unitElement.value

const avgElement: HTMLInputElement = document.querySelector('#avg')!

export const setAvg = (avg: number) => {
  avgElement.value = avg.toString()
}

export const getAvg = (): number => parseFloat(avgElement.value)

const maxElement: HTMLInputElement = document.querySelector('#max')!

export const setMax = (max: number) => {
  maxElement.value = max.toString()
}

export const getMax = (): number => parseFloat(maxElement.value)

const writeInfoElement: HTMLSpanElement = document.querySelector('#writeInfo')!

export const setWriteInfo = (message: string) =>
  (writeInfoElement.textContent = message)

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
