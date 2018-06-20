import * as BotService from '../../service/botService';
import * as CR from '../command-runner.message';


export const name = 'help';
export const info = '用来查看所有指令或者某特定指令的使用方法的指令, \'!help 指令名\' 来调用';

export function exec(params, body) {
  const commandName = params;
  let content;
  if (commandName) {
    content = showOne(commandName);
  } else {
    content = showAll();
  }
  BotService.sendGroup(body.group_id, content);
}

function showOne(name) {
  const cm = CR.commandMap[name];
  if (cm) {
    return `指令名: ${name}\n描述: ${CR.commandMap[name].info || '无描述'}`;
  } else {
    return `指令'${name}'不存在`;
  }
}

function showAll() {
  let content = '';
  Object.keys(CR.commandMap).forEach((name, index, array) => {
    content += `指令名: ${name}\n描述: ${CR.commandMap[name].info || '无描述'}`;
    if (index !== array.length - 1) {
      content += '\n------\n';
    }
  });
  return content;
}