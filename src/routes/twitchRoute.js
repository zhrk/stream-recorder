const { format } = require('date-fns');
const { verifyTwitch } = require('../utils/verify');
const downloadStream = require('../utils/downloadStream');
const { logger } = require('../services/logger');

const twitchRoute = async (c) => {
  const messageType = c.req.header('twitch-eventsub-message-type');

  const messageId = c.req.header('Twitch-Eventsub-Message-Id');
  const timestamp = c.req.header('Twitch-Eventsub-Message-Timestamp');
  const signature = c.req.header('Twitch-Eventsub-Message-Signature');

  const rawBody = await c.req.text();

  const body = await c.req.json();

  const {
    event,
    challenge,
    subscription: { type },
  } = body;

  logger.info(body);

  if (verifyTwitch(messageId, timestamp, signature, rawBody)) {
    if (messageType === 'webhook_callback_verification') return c.body(challenge, 200);

    if (messageType === 'notification') {
      if (type === 'stream.online') {
        const {
          started_at,
          broadcaster_user_name: username,
          broadcaster_user_login: channel_slug,
        } = event;

        const startTime = format(new Date(started_at), 'yyyy-MM-dd_HH-mm-ss');

        console.log(
          `🟢 [t] ${username} online ${format(new Date(started_at), 'dd.MM.yyyy HH:mm:ss')}`
        );

        downloadStream('twitch', username, channel_slug, startTime);
      }

      if (type === 'stream.offline') {
        const { username } = event;

        console.log(`🔵 [t] ${username} offline`);
      }
    }
  } else {
    console.log('❌ Twitch verification failed');
  }

  return c.body(null, 204);
};

module.exports = twitchRoute;
