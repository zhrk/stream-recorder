import { Context } from 'hono';
import config from '../../config.json';
import scrapKick from '../scrapKick';

const kickManualRoute = async (c: Context) => {
  const token = c.req.header('X-Token');

  if (token !== config.token) return c.body(null, 401);

  const body = await c.req.json();

  scrapKick(body.slug, true);

  return c.body(null, 200);
};

export default kickManualRoute;
