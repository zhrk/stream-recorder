import { spawn } from 'child_process';
import config from '../config.json';

const URLS: Record<string, string> = {
  twitch: 'https://twitch.tv',
  kick: 'https://kick.com',
};

const downloadStream = (...args: string[]) => {
  const [platform, username, channel_slug, startTime] = args;

  // prettier-ignore
  const child = spawn(
    'wt',
    [
      '-w',
      '-1',
      'powershell',
      '-Command',
      'streamlink',
      '--retry-streams', '5',
      '--retry-max', '12',
      '--retry-open', '5',
      '--stream-segment-threads', '3',
      '--hls-live-restart',
      '--hls-playlist-reload-attempts', '15',
      ...(platform === 'twitch' ? ['--http-proxy', config.proxy] : []),
      `${URLS[platform]}/${channel_slug}`,
      'best',
      '-o', `${config.vods_dir}/${username}-${startTime}.mp4`,
    ],
    { stdio: 'ignore', detached: true }
  );

  child.unref();
};

export default downloadStream;
