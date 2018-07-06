import * as OSUService from '../../service/osuService';
import * as BotService from '../../service/botService';

export const name = 'unbind';
export const info = `解除osu!账号绑定, '!unbind'来调用`;

export async function exec(params, body) {
  const { group_id, user_id } = body;
  const message = await OSUService.unBindOSUId(group_id, user_id);
  BotService.sendGroup(group_id, message);
}