const { html } = require('hono/html');
const {
  getKickSubscriptions,
  registerKickSubscription,
  clearKickSubscriptions,
} = require('../utils/kick');
const layout = require('./layout');
const config = require('../../config.json');

const { channels } = config;

const kickConfigRoute = async (c) => {
  // await clearKickSubscriptions();

  // for (const channel of channels.filter((item) => item.platorm === 'kick')) {
  //   await registerKickSubscription(Number(channel.id), 'livestream.status.updated');
  // }

  const subscriptions = await getKickSubscriptions();

  return c.html(
    layout({
      children: html`
        <table>
          <tbody>
            ${subscriptions.data.data.map(
              (item) => html`<tr>
                <td>${item.id}</td>
                <td>${item.broadcaster_user_id}</td>
                <td>${item.event}</td>
              </tr>`
            )}
          </tbody>
        </table>
      `,
    })
  );
};

module.exports = kickConfigRoute;
