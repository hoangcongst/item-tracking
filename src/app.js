import TelegramBot from 'node-telegram-bot-api'
import { handleJoonggonara } from './handler/joonggonara.js'
import { GeneralRepository } from './repository/general-repository.js'

const handler = {
    'joongo': handleJoonggonara
}

export const lambdaHandler = async (event, context) => {
    const token = process.env['TELEGRAM_BOT_TOKEN'] ?? '';
    const chatId = process.env['TELEGRAM_CHAT_ID'] ?? '';
    const bot = new TelegramBot(token, { polling: false });
    const repository = new GeneralRepository()
    const keywords = (await repository.getById('KEYWORD')).keywords
    for (const query of keywords) {
        await handler[query.handler](bot, chatId, repository, query.keyword, query.min ? { min: query.min, max: query.max } : null)
    }
};
