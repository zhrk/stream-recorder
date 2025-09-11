const winston = require('winston');
const path = require('path');
const fs = require('fs');

const cwd = process.cwd();

const dir = path.join(cwd, 'logs');

if (!fs.existsSync(dir)) fs.mkdirSync(dir);

const filename = path.join(cwd, 'logs', 'messages.json');

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [new winston.transports.File({ filename })],
});

module.exports = { logger };
