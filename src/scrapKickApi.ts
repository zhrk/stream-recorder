import axios, { isAxiosError } from 'axios';
import UserAgent from 'user-agents';
import { writeFileSync, readFileSync } from 'fs';
import { KickApiVods, StoredVods } from './types';

const scrapKickApi = async (channel_slug: string) => {
  try {
    const { data } = await axios.get<KickApiVods>(
      `https://kick.com/api/v2/channels/${channel_slug}/videos`,
      { headers: { 'User-Agent': new UserAgent().toString() } }
    );

    const oldVods: StoredVods = JSON.parse(readFileSync('vods_api.json', 'utf8'));
    const existingIds = new Set(oldVods.map((o) => o.id));

    const newVods = data
      .filter((item) => !existingIds.has(item.id))
      .map((item) => ({
        title: item.session_title,
        start_time: item.start_time,
        id: item.id,
        url: item.source,
      }));

    if (newVods.length > 0) {
      writeFileSync('vods_api.json', JSON.stringify([...newVods, ...oldVods], null, 2));
    }
  } catch (error) {
    if (isAxiosError(error)) {
      console.log(error.message);
    }
  }
};

export default scrapKickApi;
