import * as BotService from '../../service/botService';
import logger from '../../utils/logger';
import { groupConfigMap } from '../../routes/japari-qqbot/main';

export const name = 'save';
export const hide = true;

export async function exec(params, body) {
  const { group_id } = body;
  let content = '';
  try {
    await BotService.saveGroupConfig(group_id, groupConfigMap[group_id] || {});
    content = '配置保存成功';
  } catch (e) {
    logger.error(e);
    content = '配置保存失败, 请查看日志';
  }
  BotService.sendGroup(body.group_id, content);
}
