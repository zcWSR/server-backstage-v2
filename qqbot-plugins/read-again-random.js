import * as BotService from '../service/botService';

export const name = '随机复读';
export const weight = 97;
export const info = '群聊中随机触发复读';

const fuduRate = 0.01;
export function go(body, res) {
  const randomRate = Math.random();
  if (randomRate < fuduRate) {
    const { content, group_id } = body;
    BotService.sayAgain(group_id, content);
    return true;
  }
  return false;
}