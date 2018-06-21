import * as BotService from '../service/botService';

export const name = '跟随复读';
export const weight = 98;
export const info = '当同一群聊连续出现相同消息三次时, 进行复读';

const fuduMap = {};
export function go (body) {
  const { group_id, message } = body;
  const group = fuduMap[group_id];
  if (group && group.message === '[图片]') {
    return true;
  }
  if (!group) {
    fuduMap[group_id] = { message, count: 1 };
  } else if (group.message !== message) {
    group.message = message;
    group.count = 1;
  } else {
    group.count += 1;
    if (group.count === 3) {
      BotService.sayAgain(group_id, message);
    }
  }
  return true;
}