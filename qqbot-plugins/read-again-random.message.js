import * as BotService from '../service/botService';

export const name = '随机复读';
export const weight = 97;
export const info = '群聊中随机触发复读, 每个群聊可设置不同随机比率';

export const defaultRate = 0.01;
export const readAgainRateMap = {};
export function go(body) {
  const { content, group_id } = body;
  const groupRate = readAgainRateMap[group_id];
  const randomRate = Math.random();
  if (groupRate === undefined) {
    readAgainRateMap[group_id] = defaultRate;
    if (randomRate < defaultRate) {
      BotService.sayAgain(group_id, content);
      return true;
    }
  } else {
    if (randomRate < groupRate) {
      BotService.sayAgain(group_id, content);
      return true;
    }
  }
  return false;
}