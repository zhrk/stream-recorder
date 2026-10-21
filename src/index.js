const net = require('net');
const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const config = require('../config.json');
const twitchRoute = require('./routes/twitchRoute');
const kickRoute = require('./routes/kickRoute');
const kickManualRoute = require('./routes/kickManualRoute');
const scrapKickApi = require('./utils/scrapKickApi');

const waitForProxy = () =>
  new Promise((resolve) => {
    const check = () => {
      const socket = net.connect(12334, '127.0.0.1', () => {
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

  const app = new Hono({ port: config.port });

  app.post('/kick/webhook', kickRoute);
  app.post('/kick/manual', kickManualRoute);

  app.post('/twitch/webhook', twitchRoute);

  serve(app);
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
