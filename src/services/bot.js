const axios = require('axios');
const config = require('../../config.json');

const { tg_bot_url } = config;

export const sendMessage = (message) => axios.post(`${tg_bot_url}/send`, { message });
