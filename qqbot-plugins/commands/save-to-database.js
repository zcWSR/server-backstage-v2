import * as BotService from '../../service/botService';

export const name = 'save';
export const info = `保存配置到数据库, '!save'来调用`;

export function exec(params, body) {
  BotService.sendGroup(body.group_id, '别调了, 还没写完');
}
