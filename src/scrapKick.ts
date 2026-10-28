import axios, { AxiosRequestConfig, isAxiosError } from 'axios';
import UserAgent from 'user-agents';
import { writeFileSync, readFileSync } from 'fs';
import { StoredVods } from './types';
import { sendMessage } from './bot';

type HTML = string;

const videoIdRegex = /\/videos\/([0-9a-f-]{36})/g;

const axiosConfig: AxiosRequestConfig = {
  responseType: 'text',
  timeout: 10000,
};

const get = async <T = HTML>(
  url: string,
  config: AxiosRequestConfig,
  validate?: (data: T) => boolean,
  retries = 10
) => {
  let lastError: unknown;

  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get<T>(url, {
        ...config,
        headers: { ...config.headers, 'User-Agent': new UserAgent().toString() },
      });

      if (validate && !validate(response.data)) {
        throw new Error(`Validation failed for ${url}`);
      }

      return response;
    } catch (error) {
      lastError = error;

      if (i < retries - 1) {
        await new Promise((resolve) => setTimeout(resolve, (i + 1) * 5000));
      }
    }
  }

  throw lastError;
};

const parseVodPage = (html: HTML, id: string): StoredVods[number] | null => {
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
        start_time: timeMatch[1].replace('T', ' ').replace('Z', ''),
        id,
        url: urlMatch[1].split('?')[0],
      }
    : null;
};

const scrapKick = async (channel_slug: string, notify: boolean) => {
  try {
    const { data: list } = await get(
      `https://kick.com/${channel_slug}/videos`,
      axiosConfig,
      (html) => html.match(videoIdRegex) !== null
    );

    const ids = [...new Set([...list.matchAll(videoIdRegex)].map((m) => m[1]))];

    const oldVods: StoredVods = JSON.parse(readFileSync('vods.json', 'utf8'));

    const oldVodsIds = oldVods.map((vod) => vod.id);

    for (const id of ids.filter((id) => !oldVodsIds.includes(id)).toReversed()) {
      const { data: page } = await get<HTML>(
        `https://kick.com/${channel_slug}/videos/${id}`,
        axiosConfig,
        (html) => parseVodPage(html, id) !== null
      );

      const vod = parseVodPage(page, id);

      if (!vod) continue;

      oldVods.unshift(vod);
      writeFileSync('vods.json', JSON.stringify(oldVods, null, 2));

      if (notify) {
        sendMessage(`${vod.title}\n<code>${vod.url}</code>`);
      }
    }
  } catch (error) {
    if (isAxiosError(error)) {
      if (!error.message.includes('timeout')) {
        console.log(error.message);
      }
    }
  }
};

export default scrapKick;
