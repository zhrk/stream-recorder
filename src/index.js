const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const bot = require('./services/bot');
const config = require('../config.json');
const indexRoute = require('./routes/indexRoute');
const twitchRoute = require('./routes/twitchRoute');
const twitchConfigRoute = require('./routes/twitchConfigRoute');
const kickRoute = require('./routes/kickRoute');
const kickConfigRoute = require('./routes/kickConfigRoute');
// require('./tunnel');

const { port } = config;

bot.launch();

const app = new Hono({ port });

app.get('/', indexRoute);

app.post('/kick/webhook', kickRoute);
app.get('/kick/config', kickConfigRoute);

app.post('/twitch/webhook', twitchRoute);
app.get('/twitch/config', twitchConfigRoute);

serve(app);
