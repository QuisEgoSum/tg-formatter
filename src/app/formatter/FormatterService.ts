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

  correctionEntityOffset(entities: MessageEntity[], offset: number, start: number) {
    for (const entity of entities) {
      if (entity.offset > start) {
        entity.offset += offset
      }
    }
  }

  format(message: string, entities: MessageEntity[]) {
    let messageOffset: number = 0
    const json = extract(message)
    for (const jsonItem of json) {
      let currentOffsetChanges = 0
      const formatted_json = JSON.stringify(jsonItem.result, null, 2)
      const offset = jsonItem.start + messageOffset + 1
      const length = formatted_json.length
      const entity = this.getJsonEntity(offset, length)
      const source_json = message.substring(jsonItem.start, jsonItem.end)
      if (formatted_json != source_json) {
        message = message.substring(0, jsonItem.start + messageOffset)
          + '\n'
          + formatted_json
          + '\n'
          + message.substring(jsonItem.end + messageOffset)
        currentOffsetChanges = (2 + formatted_json.length - source_json.length)
        messageOffset += currentOffsetChanges
      }
      entities = this.removeEntityIntersection(entities, entity)
      this.correctionEntityOffset(entities, currentOffsetChanges, entity.offset)
      entities.push(entity)
    }
    return {
      message, entities
    }
  }
}

