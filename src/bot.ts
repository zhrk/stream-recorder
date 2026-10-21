import axios from 'axios';
import config from '../config.json';

export const sendMessage = (message: string) =>
  axios.post(`${config.tg_bot_url}/send`, { message, channel: 'first' });
