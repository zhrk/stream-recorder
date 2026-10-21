const axios = require('axios');
const UserAgent = require('user-agents');
const { writeFileSync, readFileSync } = require('fs');
const { sendMessage } = require('../services/bot');
const { logKickLink } = require('../services/logger');

const axiosConfig = {
  headers: { 'User-Agent': new UserAgent().toString() },
  responseType: 'text',
};

const parseVodPage = (html, id) => {
  html = html.replace(/\\{1,2}"/g, '"').replace(/\\\\/g, '\\');

  if (!html.includes(id)) return null;

  const urlMatch = html.match(
    /"recording_url":\s*"(https:\/\/stream\.kick\.com\/[^"]+?\/media\/hls\/master\.m3u8[^"]*?)"/
  );
  const timeMatch = html.match(/"recording_url":"[^"]*",\s*"start_time":\s*"([^"]*?)"/);
  const titleMatch = html.match(/"title":\s*"([^"]*?)",\s*"viewer_count":\d+/);

  return urlMatch && timeMatch && titleMatch
    ? {
        title: titleMatch[1],
        start_time: timeMatch[1],
        id,
        url: urlMatch[1].split('?')[0],
      }
    : null;
};

const scrapKick = async (channel_slug, notify) => {
  try {
    const { data: list } = await axios.get(`https://kick.com/${channel_slug}/videos`, axiosConfig);

    const ids = [...new Set([...list.matchAll(/\/videos\/([0-9a-f-]{36})/g)].map((m) => m[1]))];

    const oldVods = JSON.parse(readFileSync('vods.json'));

    const oldVodsIds = oldVods.map((vod) => vod.id);

    for (const id of ids.filter((id) => !oldVodsIds.includes(id))) {
      const { data: page } = await axios.get(
        `https://kick.com/${channel_slug}/videos/${id}`,
        axiosConfig
      );

      const vod = parseVodPage(page, id);

      if (!vod) continue;

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
