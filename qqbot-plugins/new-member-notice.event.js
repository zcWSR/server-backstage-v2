import * as BotService from '../service/botService';
import { groupConfigMap } from '../routes/japari-qqbot/main';

import logger from '../utils/logger';

export const name = '入群广播';
export const weight = 1;
export const info = '入群提醒, 暂时不可配置';

const defaultMsg = name => `欢迎 ${name} 加入本群! 请使用"!help"查看可用指令~`;

export async function go(body) {
  const { event, group_id, user_id } = body;
  if (event !== 'group_increase') return true;
  logger.info(`群${group_id}有新成员${user_id}加入, 正在查询昵称...`);
  const memberName = await BotService.getGroupMemberName(group_id, user_id);
  if (!memberName) return true;
  logger.info(`${user_id}昵称为${memberName}, 发送欢迎入群消息`);
  const config = groupConfigMap[group_id] || {};
  let msg;
  if (config.newMemberNotice) {
    msg = convertMsg(config.newMemberNotice, memberName);
  } else {
    msg = defaultMsg(memberName);
  }
  BotService.sendGroup(group_id, msg);
  return true;
}

function convertMsg(msg, memberName) {
  return msg.replace('${name}', memberName);
}
