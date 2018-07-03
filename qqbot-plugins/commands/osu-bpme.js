import * as OSUService from '../../service/osuService';
import * as BotService from '../../service/botService';
import logger from '../../utils/logger';

export const name = 'bpme';
export const info = `查看所绑定账号的bp, '!bpme 第几bp'来调用, 第几bp不传默认为第一bp, 如: '!bpme 2' 或 '!bpme'`;

export async function exec(params, body) {
  const { group_id, user_id } = body;
  params = params.trim();
  const index = parseInt(params) || 1;
  const bindUserInfo = await OSUService.getBindedInfo(group_id, user_id);
  if (!bindUserInfo) {
    BotService.sendGroup(group_id, `您未绑定osu!账号, 使用'!bind xxx'进行账号绑定`);
    return;
  }
  const info = await OSUService.getBP(bindUserInfo, index);
  if (typeof info === 'string') {
    BotService.sendGroup(group_id, info); 
    return;
  }
  await OSUService.sendInfo(`bp#${index}`, info, group_id);
}
