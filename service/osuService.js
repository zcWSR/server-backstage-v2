import axios from 'axios';

import { APP_KEY } from './osu.config';
import logger from '../utils/logger';

const GET_USER_URL = 'https://osu.ppy.sh/api/get_user';
const GET_BP_URL = 'https://osu.ppy.sh/api/get_user_best';
const GET_MAP_URL = 'https://osu.ppy.sh/api/get_beatmaps';
const GET_RECENT_URL = 'https://osu.ppy.sh/api/get_user_recent';
const GET_SCORE_URL = 'https://osu.ppy.sh/api/get_scores';
const GET_MATCH_URL = 'https://osu.ppy.sh/api/get_match';

async function fetch(url, params) {
  const retryTimes = 0;
  const meta;
  while(retryTimes < 5) {
    try {
      meta = await axios({
        url,
        params: Object.assign({
          k: APP_KEY
        }, params),
        timeout: Math.pow(2, retryTimes + 1) * 1000,
      });
      continue;
    } catch (e) {
      retryTimes++;
      logger.error(`出现异常:\n${e}\n正在进行第${retryTimes}次重试`);
    }
  }
  if (retryTimes === 5) {
    logger.error(`请求: ${url} API失败5次`);
    return null;
  }
  meta = meta.data;
  return meta;
}