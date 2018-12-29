import * as BotService from '../../service/botService';

export const name = 'pr';
export const info = `舔`;

export function noPr() {
  return Math.random() < 0.1;
}

export function exec(params, body) {
  let content = 'prpr';
  if (params) {
    content = `舔舔${params}`;
  }
  if (noPr()) {
    content = '不舔了, 舔不动了';
  }
  BotService.sendGroup(body.group_id, content);
}