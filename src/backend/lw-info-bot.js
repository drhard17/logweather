const { Telegraf } = require('telegraf')

const BOT_TOKEN = process.env.BOT_TOKEN
const CHAT_ID = process.env.CHAT_ID

const bot = new Telegraf(BOT_TOKEN)

/* bot.hears('hi', (ctx) => ctx.reply('Hey there')) 
bot.hears('id', (ctx) => {
    console.log('ctx:', ctx.update.message.chat.id)
    ctx.reply('chat_id: ' + ctx.update.message.chat.id)
})
bot.start(ctx => ctx.reply('Hello nahui'))
bot.startPolling() */

module.exports = {
    sendMessage: (...msg) => {
        const text = msg.join('\r\n')
        const extra = {
            disable_web_page_preview: true,
            parse_mode: 'HTML'
        }
        bot.telegram.sendMessage(CHAT_ID, text, extra)
    }
}