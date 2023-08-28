import {TelegramController} from "@server/telegram/TelegramController"
import {Telegram} from '@server/telegram/Telegram'
import {Context} from 'telegraf'
import extract from './utils'


export class Controller extends TelegramController {
    constructor(
        private readonly telegram: Telegram
    ) {
        super()
        this.telegram.bot
          .on('channel_post', (ctx: Context) => this.formatter(ctx).catch(error => this.logger.error(error)))
    }

    async formatter(ctx: Context) {
        // @ts-ignore
        const message: string = ctx.update.channel_post.text
        const json = extract(message)
        let formatterMessage = ''
        let restMessage = message
        for (const item of json) {
            const formatted = JSON.stringify(item.result, null, 2)
            const left = restMessage.slice(0, item.start - (message.length - restMessage.length))
            restMessage = restMessage.slice(item.end - (message.length - restMessage.length))
            formatterMessage += left.trim() + '\n```\n' + formatted + '```\n\n'
        }
        formatterMessage += restMessage.trim()

        if (formatterMessage != message) {
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

