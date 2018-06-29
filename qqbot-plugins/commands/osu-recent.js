import * as OSUService from '../../service/osuService';
import * as BotService from '../../service/botService';
import logger from '../../utils/logger';

export const name = 'recent';
export const info = `查看所绑定账号的最近一次游玩记录, '!recent 最近的第几次'来调用, 第几次不传默认为最近一次, 如: '!recent 2' 或 '!recent'`;

export async function exec(params, body) {
  const { group_id, user_id } = body;
  params = params.trim();
  const index = parseInt(params) || 1;
  const bindUserInfo = await OSUService.getBindedInfo(group_id, user_id);
  if (!bindUserInfo) {
    BotService.sendGroup(group_id, `您未绑定osu!账号, 使用'!bind'进行账号绑定`);
    return;
  }
  const { osuId, mode } = bindUserInfo;
  const info = await OSUService.getRecent(osuId, mode, index);
  if (typeof info === 'string') {
    BotService.sendGroup(group_id, info);
    return;
  }
  BotService.sendGroup(group_id, JSON.stringify(info, null, 2));
  return;
}