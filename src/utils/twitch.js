const axios = require('axios');
const config = require('../../config.json');

const {
  twitch: { client_id, client_secret, callback, secret, access_token },
} = config;

const headers = {
  'Client-ID': client_id,
  Authorization: `Bearer ${access_token}`,
};

const getTwitchToken = async () => {
  const response = await axios.post(`https://id.twitch.tv/oauth2/token`, null, {
    params: { client_id, client_secret, grant_type: 'client_credentials' },
  });

  console.log(response.data);
};

const getTwitchSubscriptions = async () => {
  const response = await axios.get('https://api.twitch.tv/helix/eventsub/subscriptions', {
    headers,
  });

  return response;
};

/** @param {"stream.online" | "stream.offline"} type */
const registerTwitchSubscription = async (broadcaster_user_id, type) =>
  axios.post(
    'https://api.twitch.tv/helix/eventsub/subscriptions',
    {
      type,
      version: '1',
      condition: { broadcaster_user_id },
      transport: { method: 'webhook', callback, secret },
    },
    { headers }
  );

const deleteTwitchSubscription = (id) =>
  axios.delete(`https://api.twitch.tv/helix/eventsub/subscriptions?id=${id}`, { headers });

const clearTwitchSubscriptions = async () => {
  const subscriptions = await getTwitchSubscriptions();

  for (const subscription of subscriptions.data.data) {
    await deleteTwitchSubscription(subscription.id);
  }
};

module.exports = {
  getTwitchSubscriptions,
  registerTwitchSubscription,
  clearTwitchSubscriptions,
  getTwitchToken,
};
