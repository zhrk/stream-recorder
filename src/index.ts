import net from 'net';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import config from '../config.json';
import twitchRoute from './routes/twitchRoute';
import kickRoute from './routes/kickRoute';
import kickManualRoute from './routes/kickManualRoute';
import scrapKickApi from './scrapKickApi';

const waitForProxy = () =>
  new Promise<void>((resolve) => {
    const check = () => {
      const { hostname, port } = new URL(config.proxy);

      const socket = net.connect(Number(port), hostname, () => {
        socket.destroy();
        resolve();
      });

      socket.on('error', () => {
        socket.destroy();
        setTimeout(check, 1000);
      });
    };

    check();
  });

(async () => {
  await waitForProxy();

  const app = new Hono();

  app.post('/kick/webhook', kickRoute);
  app.post('/kick/manual', kickManualRoute);

  app.post('/twitch/webhook', twitchRoute);

  serve({ fetch: app.fetch, port: config.port });
})();

config.channels.forEach((channel) => {
  if (channel.flags.includes('api')) {
    const loop = () => {
      scrapKickApi(channel.name);
      setTimeout(loop, (Math.random() * 2 + 4) * 60000);
    };

    loop();
  }
});
