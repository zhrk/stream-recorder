const axios = require('axios');
const config = require('../config.json');

module.exports.sendMessage = (message) =>
  axios.post(`${config.tg_bot_url}/send`, { message, channel: 'first' });
