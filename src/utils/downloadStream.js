const { spawn } = require('child_process');
const { sendMessage } = require('../services/bot');

const downloadStream = (...args) => {
  const [platorm, username, channel_slug, startTime, retry = 0] = args;

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

  // child.on('exit', (code) => {
  //   if (code === 1) {
  //     if (retry <= 5) {
  //       downloadStream(...args, retry + 1);

  //       sendMessage(`retry-${retry + 1}`);
  //     }
  //   }

  //   sendMessage(`error-${code}`);
  // });
};

module.exports = downloadStream;
