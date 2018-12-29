import * as BotService from '../../service/botService';

export const name = 'auth';
export const hide = true;
export const shortInfo = '权限查询'
export const info = `查看你的权限, '!auth'来调用`;

export async function exec (params, body) {
  const { group_id, user_id } = body;
  const role = await BotService.getSenderRole(group_id, user_id);
  BotService.sendGroup(group_id, `你的权限名为: '${role}'`);
}