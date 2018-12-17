import * as BotService from '../service/botService';

export const name = '入群广播';
export const weight = 1;
export const info = '入群提醒, 暂时不可配置';

export async function go(body) {
  const { notice_type, group_id, user_id } = body;
  if (notice_type !== 'group_increase') return true;
  const memberName = await BotService.getGroupMemberName(group_id, user_id);
  const msg = `欢迎 ${memberName} 加入本群, 我是群老婆, 快来 !help 我!`;
  BotService.sendGroup(group_id, msg);
  return true;
}
