import fs from 'fs';
import path from 'path';
import knex from 'knex';
import logger from '../../utils/logger';

const dbFilePath = path.resolve(__dirname, 'qqbot.sqlite');
export const db  = knex({
  client: 'sqlite3',
  connection: {
    filename: dbFilePath
  },
  useNullAsDefault: true  
});

export async function createQQBotTable() {
  if (await db.schema.hasTable('qqbot')) return;
  return await db.schema.createTable('qqbot', table => {
    table.integer('group_id').primary();
    table.text('config');
  }).then(() => {
    logger.info(`table 'qqbot' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}