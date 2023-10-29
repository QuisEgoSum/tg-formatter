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
      const a1 = entity.offset
      const a2 = entity.offset + entity.length
      const b1 = existsEntity.offset
      const b2 = existsEntity.offset + existsEntity.length
      if (a1 < b2 && a2 > b1) {
        if ((a1 === b1 && a2 === b1) || (a1 === b2 && a2 === b2) || (a1 === b2 && a2 === b1)) {
          clearEntities.push(existsEntity)
        }
      } else {
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
    const sourceMessage = message
    let messageOffset: number = 0
    const json = extract(message)
    if (!json.length) {
      return null
    }
    const entities_json = JSON.stringify(entities)
    for (const jsonItem of json) {
      let currentOffsetChanges = 0
      const formatted_json = JSON.stringify(jsonItem.result, null, 2)
      const offset = jsonItem.start + messageOffset
      const length = formatted_json.length
      const entity = this.getJsonEntity(offset, length)
      const source_json = message.substring(jsonItem.start, jsonItem.end)
      if (formatted_json != source_json) {
        message = message.substring(0, jsonItem.start + messageOffset)
          + formatted_json
          + message.substring(jsonItem.end + messageOffset)
        currentOffsetChanges = (formatted_json.length - source_json.length)
        messageOffset += currentOffsetChanges
      }
      this.correctionEntityOffset(entities, currentOffsetChanges, entity.offset)
      entities = this.removeEntityIntersection(entities, entity)
      entities.push(entity)
    }
    if (sourceMessage == message && entities_json == JSON.stringify(entities)) {
      return null
    }
    return {
      message, entities
    }
  }
}

