const { format } = require('date-fns');
const { verifyKick } = require('../utils/verify');
const config = require('../../config.json');
const scrapKick = require('../utils/scrapKick');
const downloadStream = require('../utils/downloadStream');

const kickRoute = async (c) => {
  const messageId = c.req.header('Kick-Event-Message-Id');
  const timestamp = c.req.header('Kick-Event-Message-Timestamp');
  const signature = c.req.header('Kick-Event-Signature');

  const body = await c.req.json();
  const rawBody = await c.req.text();

  if (verifyKick(`${messageId}.${timestamp}.${rawBody}`, signature)) {
    const {
      is_live,
      started_at,
      broadcaster: { user_id, username, channel_slug },
    } = body;

    const id = String(user_id);

    if (is_live) {
      const startTime = format(new Date(started_at), 'yyyy-MM-dd_HH-mm-ss');

      console.log(
        `🟢 [k] ${username} online ${format(new Date(started_at), 'dd.MM.yyyy HH:mm:ss')}`
      );

      downloadStream('kick', username, channel_slug, startTime);

      const shouldNotify = config.channels.find(
        (channel) => channel.platorm === 'kick' && channel.id === id
      )?.notify;

      if (shouldNotify) scrapKick(channel_slug, username, startTime);
    } else {
      console.log(`🔵 [k] ${username} offline`);
    }
  } else {
    console.log('❌ Kick verification failed');
  }

  return c.body(null, 200);
};

module.exports = kickRoute;
