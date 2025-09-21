const { Telegraf } = require('telegraf');
const config = require('../../config.json');

const { tg_bot_token, tg_channel_id } = config;

const bot = new Telegraf(tg_bot_token);

const sendMessage = (message) =>
  bot.telegram.sendMessage(tg_channel_id, message, { parse_mode: 'HTML' });

module.exports = bot;
module.exports.sendMessage = sendMessage;
