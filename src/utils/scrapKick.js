const puppeteer = require('puppeteer-extra');
const { writeFileSync, readFileSync } = require('fs');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const { format } = require('date-fns');
const { DATE_TIME } = require('../constants/date');
const { sendMessage } = require('../services/bot');
const { logKickLink } = require('../services/logger');

const getLinkId = (link) => link.split('/').at(-1);

puppeteer.use(StealthPlugin());

const scrapKick = async (channel_slug, title, notify) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`https://kick.com/${channel_slug}/videos`, { waitUntil: 'domcontentloaded' });

    await page.waitForSelector('a[href*="/videos/"]');

    let links = await page.$$eval('a[href*="/videos/"]', (anchors) => {
      const filteredLinks = anchors.map((a) => a.href).filter((href) => href.includes('/videos/'));

      return [...new Set(filteredLinks)];
    });

    const oldVods = JSON.parse(readFileSync('vods.json'));

    const oldVodsIds = oldVods.map((vod) => vod.id);

    links = links.filter((link) => !oldVodsIds.includes(getLinkId(link)));

    await page.close();

    for (const link of links) {
      const vodPage = await browser.newPage();

      await vodPage.goto(link, { waitUntil: 'domcontentloaded' });

      const html = await vodPage.content();

      const data = html.match(
        /recording_url\\*":\\*"([^"]*?master\.m3u8[^"]*?)\\*",\\*"start_time\\*":\\*"([^"]*?)\\*"/
      );

      if (data) {
        const vod = {
          title,
          start_time: format(new Date(data[2]), DATE_TIME),
          id: getLinkId(link),
          url: data[1].split('?')[0],
        };

        oldVods.unshift(vod);
        writeFileSync('vods.json', JSON.stringify(oldVods, null, 2));

        logKickLink(vod);

        if (notify) {
          sendMessage(`${title}\n<code>${vod.url}</code>`);
        }
      }

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
