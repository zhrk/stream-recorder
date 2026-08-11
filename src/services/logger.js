const pino = require('pino');

const logger = pino(pino.destination('./logs/messages.log'));
const linkLogger = pino(pino.destination('./logs/links.log'));

/** @param {"twitch" | "kick"} platorm */
const log = (message, platorm) => logger.info({ payload: { platorm, message } });

const logKickLink = (message) => linkLogger.info({ payload: { message } });

module.exports = { log, logKickLink };
