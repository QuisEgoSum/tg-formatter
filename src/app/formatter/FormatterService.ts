import {MessageEntity} from 'typegram/message'
import extract from '@app/formatter/utils'


export class FormatterService {
  getJsonEntity(offset: number, length: number): MessageEntity {
    return {
      offset: offset,
      length: length,
      type: "pre",
      language: "json"
    }
  }

  removeEntityIntersection(entities: MessageEntity[], entity: MessageEntity) {
    const clearEntities: MessageEntity[] = []
    for (const existsEntity of entities) {
      const start = entity.offset
      const end = entity.offset + entity.length
      const existsEnd = existsEntity.offset + existsEntity.length
      if (
        !(
          (
            existsEntity.offset > start && existsEntity.offset < end
            || existsEnd > start && existsEnd < end
          ) || (
            existsEntity.offset == entity.offset
            && existsEntity.length == entity.length
          )
        )
      ) {
        clearEntities.push(existsEntity)
      }
    }
    return clearEntities
  }

  format(message: string, entities: MessageEntity[]) {
    let message_offset: number = 0
    const json = extract(message)
    for (const jsonItem of json) {
      const formatted_json = JSON.stringify(jsonItem.result, null, 2)
      const offset = jsonItem.start + message_offset + 1
      const length = formatted_json.length
      const entity = this.getJsonEntity(offset, length)
      const source_json = message.substring(jsonItem.start, jsonItem.end)
      if (formatted_json != source_json) {
        message = message.substring(0, jsonItem.start + message_offset)
          + '\n'
          + formatted_json
          + '\n'
          + message.substring(jsonItem.end + message_offset)
        message_offset += (2 + formatted_json.length - source_json.length)
      }
      entities = this.removeEntityIntersection(entities, entity)
      entities.push(entity)
    }
    return {
      message, entities
    }
  }
}

