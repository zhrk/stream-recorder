const { spawn } = require('child_process');
const { sendMessage } = require('../services/bot');

/** @param {"twitch" | "kick"} platorm */
const downloadStream = (platorm, username, channel_slug, startTime) => {
  const url = platorm === 'twitch' ? 'https://twitch.tv' : 'https://kick.com';
  const output = `C:/Users/PC/Desktop/server/vods/${username}-${startTime}.mp4`;
  const proxy = platorm === 'twitch' ? '--http-proxy "http://127.0.0.1:12334" ' : '';

  const child = spawn(
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
    { detached: true, stdio: 'ignore' }
  );

  child.on('exit', (code) => {
    sendMessage(`error-${code}`);
  });
};

module.exports = downloadStream;
