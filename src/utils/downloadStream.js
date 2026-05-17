const { spawn } = require('child_process');
const { logDownload } = require('../services/logger');

const downloadStream = (...args) => {
  const [platorm, username, channel_slug, startTime, retry = 0] = args;

  const url = platorm === 'twitch' ? 'https://twitch.tv' : 'https://kick.com';
  const output = `C:/Users/PC/Desktop/server/vods/${username}-${startTime}.mp4`;

  const child = spawn(
    'streamlink',
    [
      '--hls-live-restart',
      '--hls-playlist-reload-attempts',
      '60',
      ...(platorm === 'twitch' ? ['--http-proxy', 'http://127.0.0.1:12334'] : []),
      `${url}/${channel_slug}`,
      'best',
      '-o',
      output,
    ],
    { stdio: 'inherit', windowsHide: false }
  );

  child.on('exit', (code) => {
    logDownload(`[INFO] [${username}] ${code}`);
  });

  child.on('error', (err) => {
    logDownload(`[ERROR] [${username}] ${err.message}`);
  });
};

module.exports = downloadStream;
