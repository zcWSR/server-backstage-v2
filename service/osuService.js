import { deflateSync, unzipSync } from 'zlib';
import axios from 'axios';

import { db } from '../qqbot-plugins/db';
import * as BotService from './botService';
import { APP_KEY } from './osu.config';
import logger from '../utils/logger';
import { numberToOsuModes } from '../utils/osuUtils';
import toSmallCamel from '../utils/toSmallCamel';
import * as osu from 'ojsama';


const GET_USER_URL = 'https://osu.ppy.sh/api/get_user';
const GET_BP_URL = 'https://osu.ppy.sh/api/get_user_best';
const GET_MAP_URL = 'https://osu.ppy.sh/api/get_beatmaps';
const GET_RECENT_URL = 'https://osu.ppy.sh/api/get_user_recent';
const GET_SCORE_URL = 'https://osu.ppy.sh/api/get_scores';
const GET_MATCH_URL = 'https://osu.ppy.sh/api/get_match';
const GET_OSU_FILE_UTL = 'https://osu.ppy.sh/osu';

const modeMap = {
  0: 'osu!', 1: 'Taiko', 2: 'CtB', 3: 'osu!mania'
};

export async function bindOSUId(group_id, user_id, osuName, mode = 0) {
  const isBind = await getBindedInfo(group_id, user_id);
  const user = await getUserByName(osuName, mode);
  if (!user) {
    BotService.sendGroup(group_id, `查找玩家'${osuName}'失败, 请重试`);
    return;
  }
  let message;
  if (isBind) {
    await db('osu_bind').update({
      osu_id: user.user_id,
      osu_name: osuName,
      mode
    }).where({ group_id, user_id });
    message = `更新账号绑定为'${osuName}', 模式: ${modeMap[mode]}`;
  } else {
    await db('osu_bind').insert({ user_id, group_id, osu_id: user.user_id, osu_name: osuName, mode });
    message = `账号'${osuName}'绑定成功, 模式: ${modeMap[mode]}`;
  }
  BotService.sendGroup(group_id, message);
}

export async function unBindOSUId(group_id, user_id) {
  const isBind = await getBindedInfo(group_id, user_id);
  if (!isBind) {
    BotService.sendGroup(group_id, '未绑定任何账号, 无法解除绑定');
    return;
  }
  await db('osu_bind').where({ group_id, user_id }).del();
  BotService.sendGroup(group_id, '解绑成功');
}

export async function getBindedInfo(group_id, user_id) {
  const meta = await db('osu_bind').where({ group_id, user_id }).first();
  if (meta) {
    return toSmallCamel(meta, '_');
  }
  return meta;
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

export async function getBP(userInfo, index) {
  index = index || 1;
  const playInfos = await fetch(GET_BP_URL, {
    u: userInfo.osuId,
    m: userInfo.mode,
    type: 'id',
    limit: index
  });
  if (!playInfos || !playInfos.length) {
    const message = `获取${userInfo.osuName}的bp#${index}失败, ${!playInfos ? '请求出错' : '不存在bp数据'}, 请重试`
    logger.warn(message);
    return message;
  };
  let playInfo = playInfos.reverse()[0];
  const mapsInfo = await fetch(GET_MAP_URL, {
    b: playInfo.beatmap_id
  });
  if (!mapsInfo || !mapsInfo.length) {
    const message = `获取beatmap信息失败, ${!users ? '请求出错' : 'beatmap不存在'}, 请重试`
    logger.warn(message)
    return message;
  }
  let mapInfo = mapsInfo[0];
  return { playInfo: { osu_name: userInfo.osuName, ...playInfo }, mapInfo };
}

export async function getRecent(userInfo, index) {
  index = index || 1;
  const playInfos = await fetch(GET_RECENT_URL, {
    u: userInfo.osuId,
    m: userInfo.mode,
    type: 'id',
    limit: index || 1
  });
  if (!playInfos || !playInfos.length) {
    const message = `获取${userInfo.osuName}的recent#${index}失败, ${!playInfos ? '请求出错' : '不存在recent数据'}, 请重试`
    logger.warn(message);
    return message;
  }
  let playInfo = playInfos.reverse()[0];
  const mapsInfo = await fetch(GET_MAP_URL, {
    b: playInfo.beatmap_id
  });
  if (!mapsInfo || !mapsInfo.length) {
    const message = `获取beatmap信息失败, ${!users ? '请求出错' : 'beatmap不存在'}, 请重试`
    logger.warn(message)
    return message;
  }
  let mapInfo = mapsInfo[0];
  return { playInfo: { osu_name: userInfo.osuName, ...playInfo }, mapInfo };
}

export async function getPP(info) {
  const { playInfo: {
    beatmap_id,
    enabled_mods,
    maxcombo,
    countmiss,
    count50,
    count100,
    count300
  }, mapInfo } = info;
  const mapString = await getMap(beatmap_id);
  if (!mapString) {
    const message = '获取铺面信息失败';
    logger.warn(`${message}, 无法计算pp`);
    return `${message}, 请重试`;
  }
  const parser = new osu.parser();
  parser.feed(mapString);
  const map = parser.map;
  const stars = new osu.diff().calc({
    map,
    mods: +enabled_mods
  });
  const pp = osu.ppv2({
    stars,
    combo: +maxcombo,
    nmiss: +countmiss,
    n50: +count50,
    n100: +count100,
    n300: +count300
  });
  return {
    acc: pp.computed_accuracy.value(),
    pp: pp.total.toFixed(2),
    map
  };
}

async function getMap(mapId) {
  const meta = await db('osu_map').where('id', mapId).first();
  if (meta) {
    return unzipSync(Buffer.from(meta.map, 'base64')).toString();
  }
  const map = await fetch(`${GET_OSU_FILE_UTL}/${mapId}`, null, { responseType: 'text' });
  if (!map) {
    return null;
  }
  const mapZip = deflateSync(map).toString('base64');
  await db('osu_map').insert({ id: mapId, map: mapZip });
  return map;
}

async function fetch(url, params, config) {
  let retryTimes = 0;
  let meta;
  while(retryTimes < 3) {
    try {
      meta = await axios({
        url,
        params: Object.assign({
          k: APP_KEY
        }, params),
        timeout: Math.pow(3, retryTimes + 1) * 1000,
        ...config
      });
      retryTimes = 10;
    } catch (e) {
      retryTimes++;
      logger.error(`请求发生错误:${e}`);
      logger.error(`正在进行第${retryTimes}次重试`);
    }
  }
  if (retryTimes === 3) {
    logger.error(`请求: ${url} API失败5次`);
    return null;
  }
  meta = meta.data;
  return meta;
}

/**
 *
 * @param {string} prefix 前缀
 * @param {{ playInfo, mapInfo }} info
 * @param {number} group_id
 */
export async function sendInfo(prefix, info, group_id) {
  const ppInfo = await getPP(info);
  let hasOfflinePPCalc = true; // 是否离线计算了pp
  if (typeof ppInfo === 'string') {
    hasOfflinePPCalc = false;
    BotService.sendGroup(group_id, ppInfo);
    return;
  }
  const { playInfo: {
    osu_name,
    maxcombo,
    count50,
    count100,
    count300,
    countmiss,
    date,
    score,
    rank,
    enabled_mods
  }, mapInfo: { beatmapset_id }} = info;
  const { acc, pp, map } = ppInfo;
  let message = `玩家${osu_name}的${prefix}\n--------\n`;
  message += `${map.artist} - ${map.title}`;
  if (map.title_unicode || map.artist_unicode) {
    message += `(${map.artist_unicode} - ${map.title_unicode})`;
  }
  message += `[${map.version}] mapped by ${map.creator}\n`;
  message += `Url: https://osu.ppy.sh/beatmapsets/${beatmapset_id}\n\n`;
  message += `AR${parseFloat(map.ar.toFixed(2))} OD${parseFloat(
    map.od.toFixed(2)
  )} CS${parseFloat(map.cs.toFixed(2))} HP${parseFloat(map.hp.toFixed(2))}\n`;
  message += `${map.ncircles} circles, ${map.nsliders} sliders, ${map.nspinners} spinners\n\n`;
  message += `Score: ${score}\n`;
  message += `Rank: ${rank}\n`;
  message += `Mod: ${numberToOsuModes(enabled_mods).join(' ')}\n`
  message += `Acc: ${(acc * 100).toFixed(2)}%\n`;
  message += `Max Combo: ${maxcombo}/${map.max_combo()}\n`;
  message += `${count300}x300, ${count100}x100, ${count50}x50, ${countmiss}xmiss\n`;
  if (info.playInfo.pp) {
    message += `${parseFloat(info.playInfo.pp).toFixed(2)} pp (官方)\n`;
  }
  message += `${pp} pp (离线计算)`;
  console.log(message);
}