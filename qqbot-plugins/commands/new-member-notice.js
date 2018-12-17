import * as BotService from '../../service/botService';
import { groupConfigMap } from '../../routes/japari-qqbot/main';

export const name = 'newNotice';
export const info = `查看当前或设置当前群的入群提醒模板, '!newNotice'来查看, '!newNotice set xxx'来设置, 模板中可使用'\$\{name\}'来代替入群人昵称`;
const defaultTpl = `欢迎 \$\{name\} 加入本群! 请使用"!help"查看可用指令~`;

export function exec(params, body) {
  const { group_id } = body;
  params = params.trim();
  if (!params) {
    if (groupConfigMap.newMemberNotice) {
      BotService.sendGroup(group_id, `模板内容:\n'${groupConfigMap.newMemberNotice}'`);
    } else {
      BotService.sendGroup(group_id, `未设置自定义模板, 以下为默认模板:\n'${defaultTpl}'`);
    }
    return;
  }
  let [key, value] = params.split(' ');
  value = value.join('');
  if (key !== 'set') {
    BotService.sendGroup(group_id, `非法参数'${key || 'null'}'`);
    return;
  }
  if (!value) {
    BotService.sendGroup(group_id, '不可设置空模板');
    return;
  }
  groupConfigMap[group_id] = groupConfigMap[group_id] || {};
  groupConfigMap[group_id].newMemberNotice = value;
  BotService.sendGroup('设置成功!');
  return;
}
