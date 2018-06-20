import fs from 'fs';
import path from 'path';
import * as BotService from '../service/botService';

const Log = require('log');
const logger = new Log('command-runner');

export const name = '指令解析';
export const weight = 99;
export const info = '相应多种指令, 具体指令集见 commands/目录';

export const commandMap = loadCommands();
export function go (body, plugins) {
  const { content } = body;
  const c = isCommand(content);
  if (!c) return true;
  const command = commandMap[c.name];
  if (command) {
    command.exec(c.params, body);
  } else {
    BotService.sendGroup(body.group_id, '你所调用的指令不存在, 尝试使用\'!help\'来查看所有可用指令');
  }
  return false;
}

/**
 * 判断是否为指令调用内容, 返回指令和参数
 * @param {string} content 完整内容
 */
function isCommand(content) {
  const match = content.match(/^[!|\uff01]([a-zA-Z]{2,}) ?(.*)$/);
  if (!match) return null;
  return {
    name: match[1],
    params: match[2]
  }
}

export function loadCommands() {
  const cmsDirPath = path.resolve(__dirname, 'commands');
  logger.info('================command-loader================');
  const cmsFilePath = fs.readdirSync(cmsDirPath)
  .map(filename => {
    return `${cmsDirPath}/${filename}`;
  });
  const commands = cmsFilePath.reduce((prev, curr) => {
    let cm;
    try {
      cm = require(curr);
      if (cm.name) {
        prev[cm.name] = cm;
        logger.info(`指令'!${cm.name}' 加载成功`);
      } else {
        throw new Error(`插件加载失败,缺少必要属性'name'\n位于: ${curr}`);
      }
    } catch (e) {
      logger.info(e);
    }
    return prev;
  }, {});
  logger.info('指令加载完成');
  logger.info('================command-loader================');
  return commands;
}
