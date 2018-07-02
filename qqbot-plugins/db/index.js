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

async function createQQBotTable() {
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

async function createOSUBindTable() {
  if (await db.schema.hasTable('osu_bind')) return;
  return await db.schema.createTable('osu_bind', table => {
    table.increments('id').primary();
    table.integer('user_id');
    table.integer('group_id');
    table.integer('osu_id');
    table.integer('mode');
  }).then(() => {
    logger.info(`table 'osu_bind' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

async function createOSUMapTable() {
  if (await db.schema.hasTable('osu_map')) return;
  return await db.schema.createTable('osu_map', table => {
    table.integer('id');
    table.text('map');
  }).then(() => {
    logger.info(`table 'osu_map' 準備完了`);
  }).catch(err => {
    logger.err(err);
  });
}

export async function createAllTable() {
  return await Promise.all([
    createQQBotTable(),
    createOSUBindTable(),
    createOSUMapTable()
  ]).then(() => {
    logger.info('全ての plugin tables 準備完了');
  }).catch(err => {
    logger.error(err);
  });
}