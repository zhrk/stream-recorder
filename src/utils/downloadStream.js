const { spawn } = require('child_process');

const URLS = {
  twitch: 'https://twitch.tv',
  kick: 'https://kick.com',
};

const downloadStream = (...args) => {
  const [platform, username, channel_slug, startTime] = args;

  const url = URLS[platform];
  const output = `C:/Users/PC/Desktop/server/vods/${username}-${startTime}.mp4`;
  const proxy = platform === 'twitch' ? '--http-proxy "http://127.0.0.1:12334" ' : '';

  spawn(
    'wt',
    [
      '-w',
      '-1',
      'powershell',
      '-Command',
      `streamlink`,
      `--hls-live-restart`,
      `--hls-playlist-reload-attempts 60`,
      `${proxy}${url}/${channel_slug}`,
      `best`,
      `-o ${output}`,
    ],
    { stdio: 'ignore', detached: true }
  );
};

module.exports = downloadStream;
