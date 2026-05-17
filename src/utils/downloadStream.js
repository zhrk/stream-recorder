const { spawn } = require('child_process');
const { logDownload } = require('../services/logger');

const downloadStream = (...args) => {
  const [platorm, username, channel_slug, startTime, retry = 0] = args;

  const url = platorm === 'twitch' ? 'https://twitch.tv' : 'https://kick.com';
  const output = `C:/Users/PC/Desktop/server/vods/${username}-${startTime}.mp4`;
  const proxy = platorm === 'twitch' ? '--http-proxy "http://127.0.0.1:12334" ' : '';

  const child = spawn(
    'streamlink',
    [
      '--hls-live-restart',
      '--hls-playlist-reload-attempts 60',
      `${proxy}${url}/${channel_slug}`,
      'best',
      `-o ${output}`,
    ],
    { stdio: 'ignore', windowsHide: false }
  );

  child.on('exit', (code) => {
    logDownload(`[INFO] [${username}] ${code}`);
  });

  child.on('error', (err) => {
    logDownload(`[ERROR] [${username}] ${err.message}`);
  });
};

module.exports = downloadStream;
