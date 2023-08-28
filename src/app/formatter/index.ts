import {Controller} from "@app/formatter/controller"
import {Telegram} from '@server/telegram/Telegram'


export async function initFormatter(telegram: Telegram) {
    new Controller(telegram)
}
