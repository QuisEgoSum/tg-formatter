import {TelegramController} from "@server/telegram/TelegramController"
import {Telegram} from '@server/telegram/Telegram'
import {Context} from 'telegraf'
import extract from './utils'


export class Controller extends TelegramController {
    protected send_error_message = false
    constructor(
        private readonly telegram: Telegram
    ) {
        super()
        this.telegram.bot
          .on('channel_post', (ctx: Context) => this.formatter(ctx).catch(error => this.logger.error(error)))
    }

    async formatter(ctx: Context) {
        // @ts-ignore
        let message: string = ctx.update.channel_post.text
        let isCaption = false
        // @ts-ignore
        if (!message && ctx.update.channel_post.caption) {
            // @ts-ignore
            message = ctx.update.channel_post.caption
            isCaption = true
        }
        if (message) {
            const json = extract(message)
            let formatterMessage = ''
            let restMessage = message
            for (const item of json) {
                const formatted = JSON.stringify(item.result, null, 2)
                const left = restMessage.slice(0, item.start - (message.length - restMessage.length))
                restMessage = restMessage.slice(item.end - (message.length - restMessage.length))
                formatterMessage += left.trim() + '\n```json\n' + formatted + '```\n\n'
            }
            formatterMessage += restMessage

            formatterMessage = formatterMessage.trim()

            if (formatterMessage != message) {
                if (isCaption) {
                    await this.telegram.bot.telegram.editMessageCaption(
                      // @ts-ignore
                      ctx.update.channel_post.sender_chat.id,
                      // @ts-ignore
                      ctx.update.channel_post.message_id,
                      undefined,
                      formatterMessage,
                      {parse_mode: 'Markdown'}
                    )
                } else {
                    await this.telegram.bot.telegram.editMessageText(
                      // @ts-ignore
                      ctx.update.channel_post.sender_chat.id,
                      // @ts-ignore
                      ctx.update.channel_post.message_id,
                      undefined,
                      formatterMessage,
                      {parse_mode: 'Markdown'}
                    )
                }
            }
        }
    }
}

