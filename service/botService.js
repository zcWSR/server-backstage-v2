import axios from 'axios';
import { db } from '../qqbot-plugins/db';
import logger from '../utils/logger';

const HOST = 'http://zcwsr.com:5000';
// const HOST = 'http://127.0.0.1:5000';

export async function loadGroupConfig() {
  const rows = await db('qqbot').select('*');
  const result = rows.reduce((prev, curr) => {
    try {
      const config = JSON.parse(curr.config);
      prev[curr.group_id] = config;
    } catch (e) {
      logger.error(e);
      process.exit();
    }
    return prev;
  }, {});
  logger.debug('群插件配置json:', JSON.stringify(result, null, 2));
  return result;
}

export async function clearGroupConfig(group_id) {
  await db('qqbot')
    .update('config', JSON.stringify({}))
    .where('group_id', group_id);
}

export async function saveGroupConfig(group_id, config) {
  const configBefore = await db('qqbot')
    .first('group_id')
    .where('group_id', group_id);
  const configString = JSON.stringify(config);
  if (configBefore) {
    await db('qqbot')
      .update('config', configString)
      .where('group_id', group_id);
  } else {
    logger.debug(group_id, '群插件配置不存在, 创建之');
    await db('qqbot').insert({ group_id: group_id, config: configString });
  }
}

export function sayAgain(group_id, content, timeout = 2000) {
  setTimeout(() => {
    sendGroup(group_id, content);
  }, timeout);
}
export function sendGroup(group_id, message) {
  axios.post(`${HOST}/send_group_msg`, { group_id, message });
}

export async function isSenderOwner(group_id, user_id) {
  return (await getSenderRole(group_id, user_id)) === 'owner';
}

export async function isSenderAdmin(group_id, user_id) {
  return (await getSenderRole(group_id, user_id)) === 'admin';
}

export async function isSenderOwnerOrAdmin(group_id, user_id) {
  const role = await getSenderRole(group_id, user_id);
  return role === 'admin' || role === 'owner';
}

export async function getSenderRole(group_id, user_id) {
  try {
    // await axios.get('http://localhost:5000/openqq/get_group_info');
    const meta = await axios.post(
      `${HOST}/get_group_member_info`,
      { group_id, user_id }
    );
    let memberInfo = meta.data.data;
    if (!memberInfo) return null;
    if (!memberInfo.user_id) return null;
    return memberInfo.role;
  } catch (e) {
    logger.error(e);
    return null;
  }
}
