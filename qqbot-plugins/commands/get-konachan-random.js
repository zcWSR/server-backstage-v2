import axios from 'axios';
import logger from '../../utils/logger';
import * as BotService from '../../service/botService';
import * as OSUService from '../../service/osuService';

export const name = 'hso';
export const info = 'hso';

export async function exec(params, body) {
  params = (params || '').trim();
  const hsoUrl = await getHso(params === '+');
  if (hsoUrl) {
    BotService.sendGroup(body.group_id, `hso\n${hsoUrl}`);
  } else {
    BotService.sendGroup(body.group_id, `出现错误, 色不动了`);
  }
}

let hsoList = [];
let hsoPlusList = [];
let hsoTime = new Date().getTime();
let hsoPlusTime = new Date().getTime();

export async function getHso(hMode = false) {
  const now = new Date().getTime();
  const time = hMode ? hsoPlusTime : hsoTime;
  const list = hMode ? hsoPlusList : hsoList;
  let meta;
  if (now - time > 1000 * 60 * 60 || list.length === 0) {
    meta = (await OSUService.fetch(
      `http://konachan.${hMode ? 'com' : 'net'}/post.json`,
      {
        limit: 100
      },
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
        }
      }
    )) || [];
  }
  if (hMode) {
    hsoPlusList = meta;
  } else {
    hsoList = meta;
  }
  if (!meta.length) return null;
  const hsoImage = meta[Math.floor(Math.random() * meta.length)];
  let hsoUrl = hsoImage.file_url;
  if(/^\/\//.test(hsoUrl)) {
    return `http:${hsoUrl}`
  }
  return hsoUrl;
}
