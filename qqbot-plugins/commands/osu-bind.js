import * as OSUService from '../../service/osuService';
import * as BotService from '../../service/botService';
import logger from '../../utils/logger';

export const name = 'bind';
export const info = `绑定osu!账号和mode, 使用'!bind 你的id,mode'来调用, mode不写默认为osu!模式`;

export async function exec(params, body) {
  const { group_id, user_id } = body;
  params = params.trim();
  if (!params) {
    BotService.sendGroup(group_id, `非法调用, 使用'!help bind'查看调用方式`);
    return;
  }
  params = params.split(',');
  let osuName = params[0];
  let mode = params[1] ? parseInt(params[1]) || 0 : 0;
  await OSUService.bindOSUId(group_id, user_id, osuName, mode);
}