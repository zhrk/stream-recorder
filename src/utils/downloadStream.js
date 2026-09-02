const { spawn } = require('child_process');

const URLS = {
  twitch: 'https://twitch.tv',
  kick: 'https://kick.com',
};

const downloadStream = (...args) => {
  const [platorm, username, channel_slug, startTime] = args;

  const url = URLS[platorm];
  const output = `C:/Users/PC/Desktop/server/vods/${username}-${startTime}.mp4`;
  const proxyArgs = platorm === 'twitch' ? ['--http-proxy', 'http://127.0.0.1:12334'] : [];

  const processName = `streamlink-${username}-${startTime}`;

  const streamlinkCommand = [
    'streamlink',
    '--hls-live-restart',
    '--hls-playlist-reload-attempts',
    '60',
    ...proxyArgs,
    `${url}/${channel_slug}`,
    'best',
    '-o',
    `\\"${output}\\"`,
  ].join(' ');

  spawn('oxmgr.exe', [`start \\"${streamlinkCommand}\\" --name "${processName}" --restart never`], {
    stdio: 'ignore',
    detached: true,
    shell: true,
  });
};

module.exports = downloadStream;
