import * as BotService from '../service/botService';
import { groupConfigMap } from '../routes/japari-qqbot/main';

export const name = '随机复读';
export const weight = 97;
export const info = '群聊中随机触发复读, 每个群聊可设置不同随机比率';

export const defaultRate = 0.01;
export function go(body) {
  const { message, group_id } = body;
  const groupRate = (groupConfigMap[group_id] || {}).readAgainRate;
  const randomRate = Math.random();
  if (groupRate === undefined) {
    if (!groupConfigMap[group_id]) groupConfigMap[group_id] = {};
    groupConfigMap[group_id].readAgainRate = defaultRate;
    if (randomRate < defaultRate) {
      BotService.sayAgain(group_id, message);
      return true;
    }
  } else {
    if (randomRate < groupRate) {
      BotService.sayAgain(group_id, message);
      return true;
    }
  }
  return false;
}