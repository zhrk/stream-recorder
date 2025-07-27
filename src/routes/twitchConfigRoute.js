const { html } = require('hono/html');
const layout = require('./layout');
const {
  getTwitchSubscriptions,
  registerTwitchSubscription,
  clearTwitchSubscriptions,
} = require('../utils/twitch');
const config = require('../../config.json');

const { channels } = config;

const twitchConfigRoute = async (c) => {
  // await clearTwitchSubscriptions();

  // for (const channel of channels.filter((item) => item.platorm === 'twitch')) {
  //   await registerTwitchSubscription(channel.id, 'stream.online');
  // }

  const subscriptions = await getTwitchSubscriptions();

  return c.html(
    layout({
      children: html`
        <table>
          <tbody>
            ${subscriptions.data.data.map(
              (item) => html`<tr>
                <td>${item.id}</td>
                <td>${item.condition.broadcaster_user_id}</td>
                <td>${item.type}</td>
                <td>${item.status}</td>
              </tr>`
            )}
          </tbody>
        </table>
      `,
    })
  );
};

module.exports = twitchConfigRoute;
