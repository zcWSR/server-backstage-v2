import * as BotService from '../service/botService';

export const name = '不响应私聊';
export const weight = 1000;
export const info = '不响应私聊, 只响应群聊, 启用此插件将过滤掉比其权重低的所有插件';

export function go (body) {
  return !!body.group_id;
}