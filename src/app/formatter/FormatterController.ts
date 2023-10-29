import {TelegramController} from "@server/telegram/TelegramController"
import {Telegram} from '@server/telegram/Telegram'
import {Context} from 'telegraf'
import {Message} from 'typegram/message'
import {Chat} from 'typegram/manage'
import {FormatterService} from '@app/formatter/FormatterService'


export class FormatterController extends TelegramController {
    protected send_error_message = false
    constructor(
        private readonly telegram: Telegram,
        private readonly service: FormatterService
    ) {
        super()
        this.telegram.bot
          .on('channel_post', (ctx: Context) => this.formatter(ctx))
    }

    async formatter(ctx: Context) {
        let message: string
        let isCaption: boolean
        let entities
        const post = ctx.channelPost as Message
        if ('caption' in post) {
            isCaption = true
            if (post.caption) {
                message = post.caption
                entities = post.caption_entities || []
            } else {
                return
            }
        } else if ('text' in post) {
            isCaption = false
            message = post.text
            entities = post.entities || []
        } else {
            return
        }
        const formatted = this.service.format(message, entities)
        const chat = post.sender_chat as Chat
        if (isCaption) {
            await this.telegram.bot.telegram.editMessageCaption(
              chat.id,
              post.message_id,
              undefined,
              formatted.message,
              {caption_entities: formatted.entities}
            )
        } else {
            await this.telegram.bot.telegram.editMessageText(
              chat.id,
              post.message_id,
              undefined,
              formatted.message,
              {entities: formatted.entities}
            )
        }
    }
}

