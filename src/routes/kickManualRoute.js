const { manualScrapKick } = require('../utils/kick');

const kickManualRoute = async (c) => {
  const body = await c.req.json();

  const slug = body.slug;

  manualScrapKick(slug);

  return c.body(null, 200);
};

module.exports = kickManualRoute;
