const axios = require('axios');
const config = require('../../config.json');

const { tg_bot_url } = config;

module.exports.sendMessage = (message) => axios.post(`${tg_bot_url}/send`, { message });
