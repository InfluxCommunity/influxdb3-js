import {Field} from 'apache-arrow'
import {isNumber, isUnsignedNumber} from './common'
import {Type as ArrowType} from 'apache-arrow/enum'

/**
 * Function to cast value return base on metadata from InfluxDB.
 *
 * @param field the Field object from Arrow
 * @param value the value to cast
 * @return the value with the correct type
 */
export function getMappedValue(field: Field, value: any): any {
  if (value === null || value === undefined) {
    return null
  }

  const metaType = field.metadata.get('iox::column::type')

  if (!metaType || (!metaType && field.typeId === ArrowType.Timestamp)) {
    return value
  }

  const [, , valueType, _fieldType] = metaType.split('::')

  if (valueType === 'timestamp') {
    return value
  }

  if (valueType === 'field') {
    switch (_fieldType) {
      case 'integer':
        if (isNumber(value)) {
          return parseInt(value)
        }
        console.warn(`Value ${value} is not an integer`)
        return value
      case 'uinteger':
        if (isUnsignedNumber(value)) {
          return parseInt(value)
        }
        console.warn(`Value ${value} is not an unsigned integer`)
        return value
      case 'float':
        if (isNumber(value)) {
          return parseFloat(value)
        }
        console.warn(`Value ${value} is not a float`)
        return value
      case 'boolean':
        if (typeof value === 'boolean') {
          return value
        }
        console.warn(`Value ${value} is not a boolean`)
        return value
      case 'string':
        if (typeof value === 'string') {
          return String(value)
        }
        console.warn(`Value ${value} is not a string`)
        return value
      default:
        return value
    }
  }
}
