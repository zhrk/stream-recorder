const { spawn } = require('child_process');

/** @param {"twitch" | "kick"} platorm */
const downloadStream = (platorm, username, channel_slug, startTime) => {
  const exe = 'C:/Programs/streamlink/bin/streamlink.exe';
  const url = platorm === 'twitch' ? 'https://twitch.tv' : 'https://kick.com';
  const output = `C:/Users/PC/Desktop/server/vods/${username}-${startTime}.mp4`;
  const proxy = platorm === 'twitch' ? '--http-proxy "http://127.0.0.1:12334" ' : '';

  spawn(
    'wt',
    [
      '-w',
      '-1',
      'powershell',
      '-Command',
      `${exe}`,
      `--hls-live-restart`,
      `--hls-playlist-reload-attempts 60`,
      `${proxy}${url}/${channel_slug}`,
      `best`,
      `-o ${output}`,
    ],
    { detached: true, stdio: 'ignore' }
  );
};

module.exports = downloadStream;
