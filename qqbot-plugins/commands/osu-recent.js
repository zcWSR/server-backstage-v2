import * as OSUService from '../../service/osuService';
import * as BotService from '../../service/botService';
import logger from '../../utils/logger';

export const name = 'recent';
export const info = `查看所绑定账号的最近一次游玩记录, '!recent 最近的第几次'来调用, 第几次不传默认为最近一次, 如: '!recent 2' 或 '!recent'`;

export async function exec(params, body) {
  const { group_id, user_id } = body;
  params = params.trim();
  const index = parseInt(params);
  if (!index) {
    BotService.sendGroup(group_id, `非法参数'${params}', 使用'!help recent'查看使用方法'`);
    return;
  }
  if (index > 20 || index < 1) {
    BotService.sendGroup(group_id, `仅支持recent查询范围#1-#20, 请重试`);
    return;
  }
  const bindUserInfo = await OSUService.getBindedInfo(group_id, user_id);
  if (!bindUserInfo) {
    BotService.sendGroup(group_id, `您未绑定osu!账号, 使用'!bind'进行账号绑定`);
    return;
  }
  const info = await OSUService.getRecent(bindUserInfo, index);
  if (typeof info === 'string') {
    BotService.sendGroup(group_id, info);
    return;
  }
  await OSUService.sendInfo(`recent#${index}`, info, group_id);
}