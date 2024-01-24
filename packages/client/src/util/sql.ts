import {QParamType} from '../QueryApi'
import {throwReturn} from './common'

const rgxParam = /(?:^|\W)\$(\w+)(?!\w)/g
export function queryHasParams(query: string): boolean {
  return !!query.match(rgxParam)
}

export function allParamsMatched(
  query: string,
  qParams: Map<string, QParamType>
): boolean {
  const matches = query.match(rgxParam)

  if (matches) {
    for (const match of matches) {
      if (!qParams.get(match.trim().replace('$', ''))) {
        throwReturn(
          new Error(
            `No parameter matching ${match} provided in the query params map`
          )
        )
      }
    }
  }
  return true
}
