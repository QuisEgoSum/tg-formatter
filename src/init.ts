import {createTelegramBot} from '@server/telegram'
import {initNotification} from '@app/notification'
import {initFormatter} from '@app/formatter'


export async function initApp() {
  const telegram = await createTelegramBot()

  await initFormatter(telegram)
  const notification = await initNotification(telegram)

  telegram.logging()

  return {
    bot: telegram,
    notification: notification
  }
}