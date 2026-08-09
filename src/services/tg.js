const { TelegramClient } = require('telegram');
const { StringSession } = require('telegram/sessions');
const config = require('../../config.json');
const { writeFileSync } = require('fs');
const path = require('path');
const { Logger } = require('telegram/extensions');

const { tg } = config;

(async () => {
  const client = new TelegramClient(new StringSession(tg.app.session), tg.app.id, tg.app.hash, {
    proxy: { ip: '127.0.0.1', port: 12334, socksType: 5 },
    baseLogger: new Logger('none'),
  });

  await client.start();

  console.log('✅ client');

  client.addEventHandler(async (update) => {
    if (update.className === 'UpdateNewChannelMessage') {
      if (update.message.fromId.channelId.value === BigInt(tg.app.chat_id)) {
        writeFileSync(
          path.join(process.cwd(), 'tg', `${new Date().getTime()}.json`),
          JSON.stringify(update, null, 2)
        );
      }
    }
  });
})();
