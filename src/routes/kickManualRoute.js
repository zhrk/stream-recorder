const config = require('../../config.json');
const scrapKick = require('../utils/scrapKick');

const kickManualRoute = async (c) => {
  const token = c.req.header('X-Token');

  if (token !== config.token) return c.body(null, 401);

  const body = await c.req.json();

  scrapKick(body.slug, true);

  return c.body(null, 200);
};

module.exports = kickManualRoute;
