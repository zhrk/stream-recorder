const { Telegraf } = require('telegraf');
const { HttpsProxyAgent } = require('https-proxy-agent');
const config = require('../../config.json');

const { tg } = config;

const agent = new HttpsProxyAgent('http://127.0.0.1:12334');
const bot = new Telegraf(tg.bot.token, { telegram: { agent } });

const sendMessage = (message) =>
  bot.telegram.sendMessage(tg.bot.channel_id, message, { parse_mode: 'HTML' });

module.exports = bot;
module.exports.sendMessage = sendMessage;
