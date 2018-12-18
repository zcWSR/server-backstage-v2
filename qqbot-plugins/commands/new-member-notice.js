import * as BotService from '../../service/botService';
import { groupConfigMap } from '../../routes/japari-qqbot/main';

export const name = 'newNotice';
export const info = `查看当前或设置当前群的入群提醒模板, '!newNotice'来查看, '!newNotice set xxx'来设置, 模板中可使用'\$\{name\}'来代替入群人昵称`;
const defaultTpl = `欢迎 \$\{name\} 加入本群! 请使用"!help"查看可用指令~`;

export async function exec(params, body) {
  const { group_id, user_id } = body;
  params = params.trim();
  const config = groupConfigMap[group_id] || {};
  if (!params) {
    if (config.newMemberNotice) {
      BotService.sendGroup(
        group_id,
        `模板内容:\n'${groupConfigMap.newMemberNotice}'`
      );
    } else {
      BotService.sendGroup(
        group_id,
        `未设置自定义模板, 以下为默认模板:\n'${defaultTpl}'`
      );
    }
    return;
  }
  const { key, value } = getValue(params);
  if (key !== 'set') {
    BotService.sendGroup(group_id, `非法参数'${key || 'null'}'`);
    return;
  }
  if (!value) {
    BotService.sendGroup(group_id, '不可设置空模板');
    return;
  }
  if (!(await BotService.isSenderOwnerOrAdmin(group_id, user_id))) {
    BotService.sendGroup(group_id, '设置失败, 仅管理员及以上拥有权限');
    return;
  }
  config.newMemberNotice = value;
  groupConfigMap[group_id] = config;
  BotService.sendGroup(group_id, '设置成功!');
  return;
}

function getValue(params) {
  const match = params.match(/^(\w+)\s(.*)/);
  if (!match) {
    return {
      key: match,
      value: null
    }
  }
  return {
    key: match[1],
    value: match[2]
  }
}
