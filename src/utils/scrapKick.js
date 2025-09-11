const puppeteer = require('puppeteer-extra');
const { writeFileSync, readFileSync, existsSync, mkdirSync } = require('fs');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const config = require('../../config.json');
const bot = require('../services/bot');
const zip = require('./zip');

let retries = 0;

const errorNotFound = 'VODs not found';

const { tg_channel_id } = config;

puppeteer.use(StealthPlugin());

const scrapKick = async (channel_slug, username, startTime) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`https://kick.com/${channel_slug}/videos`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });

    const content = await page.content();

    let titles = content.match(/"session_title.*?",/g);
    let dates = content.match(/"start_time.*?",/g);
    const urls = content.match(/https:\/\/stream\.kick\.com[^"\s]*?\.m3u8/g);

    if (titles === null || dates === null || urls === null) {
      throw new Error(errorNotFound);
    }

    if (titles.length > urls.length && dates.length > urls.length) {
      titles = titles.toSpliced(-1, 1);
      dates = dates.toSpliced(-1, 1);
    }

    const scrappedVods = zip(titles, urls, dates).map((item) => ({
      title: item[0].replace('"session_title\\":\\"', '').replace('\\",', ''),
      start_time: item[2].replace('"start_time\\":\\"', '').replace('\\",', ''),
      url: item[1],
    }));

    const oldVods = JSON.parse(readFileSync('vods.json'));

    const oldVodsUrls = new Set(oldVods.map((vod) => vod.url));

    const newVods = scrappedVods.filter((vod) => vod.url && !oldVodsUrls.has(vod.url));

    if (newVods.length) {
      newVods.forEach((vod) => {
        bot.telegram.sendMessage(tg_channel_id, `${vod.title}\n<code>${vod.url}</code>`, {
          parse_mode: 'HTML',
        });
      });

      writeFileSync('vods.json', JSON.stringify([...newVods, ...oldVods], null, 2));
      retries = 0;
    } else {
      throw new Error(errorNotFound);
    }
  } catch (error) {
    if (error.message === errorNotFound || error instanceof puppeteer.TimeoutError) {
      retries = retries + 1;

      setTimeout(() => {
        scrapKick(channel_slug, username, startTime);
      }, 10000);
    } else {
      console.log(error.message);
    }
  } finally {
    await browser.close();
  }
};

module.exports = scrapKick;
