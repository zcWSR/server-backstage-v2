import * as BotService from '../service/botService';
import logger from '../utils/logger';

export const name = '入群广播';
export const weight = 1;
export const info = '入群提醒, 暂时不可配置';

export async function go(body) {
  const { notice_type, group_id, user_id } = body;
  if (notice_type !== 'group_increase') return true;
  logger.info(`群${group_id}有新成员${user_id}加入, 正在查询昵称...`);
  const memberName = await BotService.getGroupMemberName(group_id, user_id);
  if (!memberName) return true;
  logger.info(`${user_id}昵称为${memberName}, 发送欢迎入群消息`);
  const msg = `欢迎 ${memberName} 加入本群, 我是群老婆, 快来 !help 我!`;
  BotService.sendGroup(group_id, msg);
  return true;
}
