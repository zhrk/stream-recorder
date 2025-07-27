const { spawnSync } = require('child_process');
const config = require('../../config.json');

const { tunnel_subdomain } = config;

const name = `--name=${tunnel_subdomain}`;

const checkTunnel = () => {
  const { stderr } = spawnSync('tuna', ['service', 'status', name], { encoding: 'utf-8' });

  if (!stderr.includes('Service is running')) {
    console.log(`[${new Date().toISOString()}] Service not running. Restarting...`);
    spawnSync('tuna', ['service', 'restart', name], { encoding: 'utf-8' });
  }
};

setInterval(checkTunnel, 10000);

checkTunnel();
