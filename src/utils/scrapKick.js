const puppeteer = require('puppeteer-extra');
const { writeFileSync, readFileSync } = require('fs');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { sendMessage } = require('../services/bot');

const getLinkId = (link) => link.split('/').at(-1);

puppeteer.use(StealthPlugin());

const scrapKick = async (channel_slug, title, startTime) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`https://kick.com/${channel_slug}/videos`, { waitUntil: 'domcontentloaded' });

    let links = await page.$$eval('[data-testid="livestream-results-card"]>a', (anchors) =>
      anchors.map((a) => a.href)
    );

    const oldVods = JSON.parse(readFileSync('vods.json'));

    const oldVodsIds = oldVods.map((vod) => vod.id);

    links = links.filter((link) => !oldVodsIds.includes(getLinkId(link)));

    await page.close();

    for (const link of links) {
      const vodPage = await browser.newPage();
      await vodPage.setRequestInterception(true);

      vodPage.on('request', (request) => {
        let url = request.url();

        if (url.includes('master.m3u8')) {
          url = url.split('?')[0];

          writeFileSync(
            'vods.json',
            JSON.stringify(
              [{ title, start_time: startTime, id: getLinkId(link), url }, ...oldVods],
              null,
              2
            )
          );

          sendMessage(`${title}\n<code>${url}</code>`);
        }

        request.continue();
      });

      await vodPage.goto(link, { waitUntil: 'networkidle2' });

      await vodPage.close();
    }
  } catch (error) {
    if (!error.message.includes('timeout')) {
      console.log(error.message);
    }
  } finally {
    await browser.close();
  }
};

module.exports = scrapKick;
