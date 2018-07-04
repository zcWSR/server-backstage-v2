import axios from 'axios';
import logger from '../../utils/logger';
import * as BotService from '../../service/botService';
import * as OSUService from '../../service/osuService';

export const name = 'hso';
export const info = 'hso';

export async function exec(params, body) {
  const hsoUrl = await getHso();
  BotService.sendGroup(body.group_id, `hso\n${hsoUrl}`);
}

let hsoList = [];
let hsoTime = new Date().getTime();
export async function getHso() {
  const now = new Date().getTime();
  if (now - hsoTime > 1000 * 60 * 60 || hsoList.length === 0) {
    hsoList = (await OSUService.fetch(
      'http://konachan.net/post.json',
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
  const hsoImage = hsoList[Math.floor(Math.random() * hsoList.length)];
  let hsoUrl = hsoImage.file_url;
  if(/^\/\//.test(hsoUrl)) {
    return `http:${hsoUrl}`
  }
  return hsoUrl
}
