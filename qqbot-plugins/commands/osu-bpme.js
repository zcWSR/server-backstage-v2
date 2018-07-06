import * as OSUService from '../../service/osuService';
import * as BotService from '../../service/botService';
import logger from '../../utils/logger';

export const name = 'bpme';
export const info = `查看所绑定账号的bp, '!bpme 第几bp'来调用, 第几bp不传默认为第一bp, 如: '!bpme 2' 或 '!bpme'`;

export async function exec(params, body) {
  const { group_id, user_id } = body;
  params = (params || '1').trim();
  const index = parseInt(params);
  if (!index) {
    BotService.sendGroup(group_id, `非法参数'${params}', 使用'!help bpme'查看使用方法'`);
    return;
  }
  if (index > 20 || index < 1) {
    BotService.sendGroup(group_id, `仅支持bp查询范围#1-#20, 请重试`);
    return;
  }
  const bindUserInfo = await OSUService.getBindedInfo(group_id, user_id);
  if (!bindUserInfo) {
    BotService.sendGroup(group_id, `非法参数, 您未绑定osu!账号, 使用'!bind'进行账号绑定`);
    return;
  }
  const info = await OSUService.getBP(bindUserInfo, index);
  if (typeof info === 'string') {
    BotService.sendGroup(group_id, info); 
    return;
  }
  await OSUService.sendInfo(`bp#${index}`, info, group_id);
}
