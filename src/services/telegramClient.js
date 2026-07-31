const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const { NewMessage } = require('telegram/events');
const config = require('../../config.json');

const { tg_app } = config;

(async () => {
  const client = new TelegramClient(new StringSession(tg_app.session), tg_app.id, tg_app.hash, {
    connectionRetries: 5,
    proxy: { ip: '127.0.0.1', port: 12334, socksType: 5 },
  });

  await client.connect();

  client.addEventHandler(
    (event) => {
      console.log(event.message);
    },
    new NewMessage({ fromUsers: tg_app.from })
  );
})();
