const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const config = require('../../config.json');

const { tg } = config;

(async () => {
  const client = new TelegramClient(new StringSession(tg.app.session), tg.app.id, tg.app.hash, {
    connectionRetries: 5,
    proxy: { ip: '127.0.0.1', port: 12334, socksType: 5 },
  });

  await client.connect();

  client.addEventHandler(
    (event) => {
      console.log(event.message);
    },
    new NewMessage({ fromUsers: tg.app.from })
  );
})();
