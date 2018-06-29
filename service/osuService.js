import axios from 'axios';

import { db } from '../qqbot-plugins/db';
import * as BotService from './botService';
import { APP_KEY } from './osu.config';
import logger from '../utils/logger';

const GET_USER_URL = 'https://osu.ppy.sh/api/get_user';
const GET_BP_URL = 'https://osu.ppy.sh/api/get_user_best';
const GET_MAP_URL = 'https://osu.ppy.sh/api/get_beatmaps';
const GET_RECENT_URL = 'https://osu.ppy.sh/api/get_user_recent';
const GET_SCORE_URL = 'https://osu.ppy.sh/api/get_scores';
const GET_MATCH_URL = 'https://osu.ppy.sh/api/get_match';

const modeMap = {
  0: 'osu!', 1: 'Taiko', 2: 'CtB', 3: 'osu!mania'
};

export async function bindOSUId(group_id, user_id, osuName, mode = 0) {
  const isBind = getBindedInfo();
  const user = await getUserByName(osuName, mode);
  if (!user) {
    BotService.sendGroup(group_id, `查找玩家'${osuName}'失败, 请重试`);
    return;
  }
  let message;
  if (isBind) {
    await db('osu_bind').update({
      osu_id: user.user_id,
      mode
    }).where({ group_id, user_id });
    message = `更新账号绑定为'${osuName}, 模式: ${modeMap[mode]}`;
  } else {
    await db('osu_bind').insert({ user_id, group_id, osu_id: user.user_id, mode });
    message = `账号'${osuName}'绑定成功, 模式: ${modeMap[mode]}`;
  }
  BotService.sendGroup(group_id, message);
}

export async function unBindOSUId(group_id, user_id) {
  const isBind = await getBindedInfo();
  if (!isBind) {
    BotService.sendGroup(group_id, '未绑定任何账号, 无法解除绑定');
    return;
  }
  await db('osu_bind').where({ group_id, user_id }).del();
  BotService.sendGroup(group_id, '解绑成功');
}

export async function getBindedInfo(group_id, user_id) {
  return await db('osu_bind').where({ group_id, user_id }).first();
}

async function getUserByName(osuName, mode = 0) {
  let users = await fetch(GET_USER_URL, {
    u: osuName,
    type: 'string',
    mode: 0
  });
  if (!users || !users.length) {
    logger.warn(`获取用户信息失败, ${!users ? '请求出错' : '不存在用户'}`);
    return null;
  }
  return users[0];
}

export async function getBP(osuId, mode, index) {
  const bps = await fetch(GET_BP_URL, {
    u: osuId,
    m: mode,
    type: 'id',
    limit: index || 1
  });
  if (!bps || !bps.length) {
    logger.warn(`获取bp信息失败, ${!bp ? '请求出错' : '不存在bp数据'}`);
    return null;
  };
  let bp = bps.reverse()[0];
  const mapsInfo = await fetch(GET_MAP_URL, {
    b: bp.beatmap_id
  });
  if (!mapsInfo || !mapsInfo.length) {
    logger.warn(`获取beatmap信息失败, ${!users ? '请求出错' : 'beatmap不存在'}`)
    return null;
  }
  let mapInfo = mapsInfo[0];
  return { bp, mapInfo };
}

export async function getRecent(osuId, mode, index) {
  const recents = await fetch(GET_RECENT_URL, {
    u: osuId,
    m: mode,
    type: 'id',
    limit: index || 1
  });
  if (!recents || !recents.length) {
    logger.warn(`获取recent信息失败, ${!recents ? '请求出错' : '不存在recent数据'}`);
    return null;
  }
  let recent = recents.reverse()[0];
  const mapsInfo = await fetch(GET_MAP_URL, {
    b: recent.beatmap_id
  });
  if (!mapsInfo || !mapsInfo.length) {
    logger.warn(`获取beatmap信息失败, ${!users ? '请求出错' : 'beatmap不存在'}`)
    return null;
  }
  let mapInfo = mapsInfo[0];
  return { recent, mapInfo };
}

async function fetch(url, params) {
  let retryTimes = 0;
  let meta;
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