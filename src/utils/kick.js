const axios = require('axios');
const config = require('../../config.json');

const {
  kick: { client_id, client_secret },
} = config;

const getHeaders = async () => {
  const token = await axios.post(
    'https://id.kick.com/oauth/token',
    { grant_type: 'client_credentials', client_id, client_secret },
    { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
  );

  return { Authorization: `Bearer ${token.data.access_token}` };
};

const getKickSubscriptions = async () => {
  const headers = await getHeaders();

  const response = await axios.get('https://api.kick.com/public/v1/events/subscriptions', {
    headers,
  });

  return response;
};

/** @param {"livestream.status.updated"} name */
const registerKickSubscription = async (broadcaster_user_id, name) => {
  const headers = await getHeaders();

  return axios.post(
    'https://api.kick.com/public/v1/events/subscriptions',
    {
      broadcaster_user_id,
      events: [
        {
          name,
          version: 1,
        },
      ],
      method: 'webhook',
    },
    { headers }
  );
};

const clearKickSubscriptions = async () => {
  const headers = await getHeaders();

  const subscriptions = await getKickSubscriptions();

  for (const subscription of subscriptions.data.data) {
    await axios.delete('https://api.kick.com/public/v1/events/subscriptions', {
      params: { id: subscription.id },
      headers,
    });
  }
};

module.exports = { getKickSubscriptions, registerKickSubscription, clearKickSubscriptions };
