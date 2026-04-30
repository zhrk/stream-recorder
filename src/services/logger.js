const pino = require('pino');

const logger = pino(pino.destination('./logs/messages.log'));
const downloadLogger = pino(pino.destination('./logs/downloads.log'));

/** @param {"twitch" | "kick"} platorm */
const log = (message, platorm) => logger.info({ payload: { platorm, message } });

const logDownload = (message) => downloadLogger.info({ payload: { message } });

module.exports = { log, logDownload };
