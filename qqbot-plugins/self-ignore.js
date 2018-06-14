export const name = '忽略自身';
export const weight = 9999999;
export const info = '防止出现发送消息后, 又被自己读取到造成死循环的情况';

export function go(body, res) {
  if (body.sender_id === 3486955134) {
    return false;
  } else {
    return true;
  }
}
