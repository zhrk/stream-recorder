const path = require('path');
const fs = require('fs');

const cwd = process.cwd();

const dir = path.join(cwd, 'logs');
const file = path.join(dir, 'messages.json');

if (!fs.existsSync(dir)) fs.mkdirSync(dir);
if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');

/** @param {"twitch" | "kick"} platorm */
const log = (message, platorm) => {
  const prev = JSON.parse(fs.readFileSync(file));

  fs.writeFileSync(file, JSON.stringify([...prev, { platorm, message }], null, 2));
};

module.exports = { log };
