import * as BotService from '../../service/botService';

export const name = 'pr';
export const info = `舔`;

export function exec(params, body) {
  let content = 'prpr';
  if (params) {
    content = `舔舔${params}`
  }
  BotService.sendGroup(body.group_id, content);
}