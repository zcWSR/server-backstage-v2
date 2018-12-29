import * as BotService from '../../service/botService';

export const name = 'roll';
export const shortInfo = 'roll一个数';
export const info = `随机roll一个整, '!roll xxx'来调用(不传递参数默认上限为100)`;

export function exec(params, body) {
  let max = 100;
  if (params) {
    max = +params || 100;
  }
  BotService.sendGroup(body.group_id, `roll: ${roll(0, max)}`);
}

function roll(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}