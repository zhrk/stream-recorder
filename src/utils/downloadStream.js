const { spawn } = require('child_process');

function findOxmgr() {
  try {
    return execFileSync('where', ['oxmgr'], {
      encoding: 'utf8',
      windowsHide: true,
    })
      .split(/\r?\n/)
      .map((x) => x.trim())
      .find(Boolean);
  } catch {
    return null;
  }
}

const OXMGR = findOxmgr();

const URLS = {
  twitch: 'https://twitch.tv',
  kick: 'https://kick.com',
};

const downloadStream = (...args) => {
  const [platform, username, channel_slug, startTime] = args;

  const url = URLS[platform];
  const output = `C:/Users/PC/Desktop/server/vods/${username}-${startTime}.mp4`;
  const proxyArgs = platform === 'twitch' ? ['--http-proxy', 'http://127.0.0.1:12334'] : [];

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
    `"${output}"`,
  ].join(' ');

  spawn(
    'cmd.exe',
    ['/c', 'oxmgr', 'start', streamlinkCommand, '--name', processName, '--restart', 'never'],
    {
      stdio: 'ignore',
      detached: true,
      windowsHide: true,
    }
  );
};

module.exports = downloadStream;
