const config = require('../../config.json');
const { manualScrapKick } = require('../utils/kick');

const kickManualRoute = async (c) => {
  const token = c.req.header('X-Token');

  if (token !== config.token) return c.body(null, 401);

  const body = await c.req.json();

  manualScrapKick(body.slug);

  return c.body(null, 200);
};

module.exports = kickManualRoute;
