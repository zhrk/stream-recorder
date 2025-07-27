const { Telegraf } = require('telegraf');
const config = require('../../config.json');

const { tg_bot_token } = config;

const bot = new Telegraf(tg_bot_token);

module.exports = bot;
