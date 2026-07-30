const pino = require('pino');

const logger = pino(pino.destination('./logs/messages.log'));

/** @param {"twitch" | "kick"} platorm */
const log = (message, platorm) => logger.info({ payload: { platorm, message } });

module.exports = { log };
