import * as BotService from '../service/botService';

export const name = '跟随复读';
export const weight = 98;
export const info = '当同一群聊连续出现相同消息为3的倍数时, 进行复读';

const fuduMap = {};
export function go (body) {
  const { group_id, content } = body;
  const group = fuduMap[group_id];
  if (group && group.content === '[图片]') {
    return true;
  }
  if (!group || group.content !== content) {
    fuduMap[group_id] = { content, count: 1 };
  } else {
    group.count += 1;
    if (group.count === 3) {
      BotService.sayAgain(group_id, content);
    }
  }
  return true;
}