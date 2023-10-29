import {FormatterController} from "@app/formatter/FormatterController"
import {Telegram} from '@server/telegram/Telegram'
import {FormatterService} from '@app/formatter/FormatterService'


export async function initFormatter(telegram: Telegram) {
    new FormatterController(telegram, new FormatterService())
}
