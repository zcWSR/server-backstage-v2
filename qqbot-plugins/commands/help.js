import * as BotService from '../../service/botService';
import * as CR from '../command-runner.message';


export const name = 'help';
export const hide = true;
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
  if (cm && !cm.hide) {
    return `指令名: ${name}\n描述: ${cm.info || '无描述'}`;
  } else {
    return `指令'${name}'不存在或被隐藏`;
  }
}

function showAll() {
  let content = `可用指令: (使用'!help 指令名'可查看详细用法)`;
  Object.keys(CR.commandMap).forEach((name, index, array) => {
    const cm = CR.commandMap[name];
    if (cm.hide) return;
    content += `\n!${name}  ${cm.shortInfo || ''}`;
  });
  return content;
}