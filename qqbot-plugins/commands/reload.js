import * as CR from '../command-runner';
import * as BotService from '../../service/botService';

export const name = 'reload';
export const info = '重新载入所有指令, 用于热更新, \'!reload\'来调用';

export function exec (params, body) {
  CR.commandMap = CR.loadCommands();
  let content = '重新载入指令成功:';
  content += Object.keys(CR.commandMap).reduce((prev, curr) => {
    prev += `\n!${curr}`;
    return prev;
  }, '');
  BotService.sendGroup(body.group_id, content);
}