const { Telegraf } = require('telegraf');
const { HttpsProxyAgent } = require('https-proxy-agent');
const config = require('../../config.json');

const { tg_bot_token, tg_channel_id } = config;

const agent = new HttpsProxyAgent('http://127.0.0.1:12334');
const bot = new Telegraf(tg_bot_token, { telegram: { agent } });

const sendMessage = (message) =>
  bot.telegram.sendMessage(tg_channel_id, message, { parse_mode: 'HTML' });

module.exports = bot;
module.exports.sendMessage = sendMessage;
