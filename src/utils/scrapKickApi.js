const axios = require('axios');
const UserAgent = require('user-agents');
const { writeFileSync, readFileSync } = require('fs');

const scrapKickApi = async (channel_slug) => {
  try {
    const { data } = await axios.get(`https://kick.com/api/v2/channels/${channel_slug}/videos`, {
      headers: { 'User-Agent': new UserAgent().toString() },
    });

    const oldVods = JSON.parse(readFileSync('vods_api.json', 'utf8'));
    const existingIds = new Set(oldVods.map((o) => o.id));

    const newVods = data
      .filter((item) => !existingIds.has(item.id))
      .map((item) => ({
        title: item.title,
        start_time: item.start_time,
        id: item.id,
        url: item.url,
      }));

    if (newVods.length > 0) {
      writeFileSync('vods_api.json', JSON.stringify([...newVods, ...oldVods], null, 2));
    }
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = scrapKickApi;
