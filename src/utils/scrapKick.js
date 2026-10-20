const axios = require('axios');
const UserAgent = require('user-agents');
const { writeFileSync, readFileSync } = require('fs');
const { format } = require('date-fns');
const { DATE_TIME } = require('../constants/date');
const { sendMessage } = require('../services/bot');
const { logKickLink } = require('../services/logger');

const scrapKick = async (channel_slug, notify) => {
  try {
    const { data: vods } = await axios.get(
      `https://kick.com/api/v2/channels/${channel_slug}/videos`,
      { headers: { 'User-Agent': new UserAgent().toString() } }
    );

    const oldVods = JSON.parse(readFileSync('vods.json'));

    const newVods = vods
      .filter((v) => !oldVods.some((o) => o.url === v.source.split('?')[0]))
      .toReversed();

    for (const info of newVods) {
      const vod = {
        title: info.session_title,
        start_time: format(new Date(info.start_time + 'Z'), DATE_TIME),
        id: info.slug,
        url: info.source.split('?')[0],
      };

      oldVods.unshift(vod);

      writeFileSync('vods.json', JSON.stringify(oldVods, null, 2));

      logKickLink(vod);

      if (notify) {
        sendMessage(`${vod.title}\n<code>${vod.url}</code>`);
      }
    }
  } catch (error) {
    if (!error.message.includes('timeout')) {
      console.log(error.message);
    }
  }
};

module.exports = scrapKick;
