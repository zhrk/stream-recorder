import { format } from 'date-fns';
import { verifyKick } from '../verify';
import config from '../../config.json';
import scrapKick from '../scrapKick';
import downloadStream from '../downloadStream';
import { DATE_TIME } from '../date';
import { Context } from 'hono';

const kickRoute = async (c: Context) => {
  const messageId = c.req.header('Kick-Event-Message-Id');
  const timestamp = c.req.header('Kick-Event-Message-Timestamp');
  const signature = c.req.header('Kick-Event-Signature');

  const body = await c.req.json();
  const rawBody = await c.req.text();

  if (await verifyKick(`${messageId}.${timestamp}.${rawBody}`, signature!)) {
    const {
      is_live,
      started_at,
      broadcaster: { user_id, username, channel_slug },
    } = body;

    const id = String(user_id);

    if (is_live) {
      const startTime = format(new Date(started_at), DATE_TIME);

      console.log(
        `🟢 [k] ${username} online ${format(new Date(started_at), 'dd.MM.yyyy HH:mm:ss')}`
      );

      const flags =
        config.channels.find((channel) => channel.platform === 'kick' && channel.id === id)
          ?.flags || [];

      if (flags.includes('download')) {
        downloadStream('kick', username, channel_slug, startTime);
      }

      scrapKick(channel_slug, flags.includes('notify'));
    }
  } else {
    console.log('❌ Kick verification failed');
  }

  return c.body(null, 200);
};

export default kickRoute;
