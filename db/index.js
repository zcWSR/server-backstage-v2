import fs from 'fs';
import path from 'path';
import knex from 'knex';
const Log = require('log');
// import bookshelf from 'bookshelf'

const logger = new Log('db');
// const projectDir = path.resolve(__dirname, '../');
const dbFilePath = path.resolve(__dirname, 'db.sqlite');
export const db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbFilePath
  },
  useNullAsDefault: true
});

export async function createPostTable() {
  if (await db.schema.hasTable('Post')) return;
  return await db.schema.createTable(`Post`, table => {
    table.uuid('id').primary();
    table.string('title');
    table.dateTime('create_at');
    table.dateTime('update_at');
    table.text('section');
    table.text('rest').nullable();
    table.integer('cate_id').references('Category.id');
    table.string('bg_color').nullable();
    table.text('bg_url').nullable();
    table.boolean('lock').defaultTo(false);
  }).then(() => {
    logger.info(`table 'Post' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createCategoryTable() {
  if (await db.schema.hasTable('Category')) return;
  return await db.schema.createTable(`Category`, table => {
    table.increments('id').primary();
    table.string('name');
  }).then(() => {
    logger.info(`table 'Category' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createLabelTable() {
  if (await db.schema.hasTable('Label')) return;
  return await db.schema.createTable(`Label`, table => {
    table.increments('id').primary();
    table.string('name');
  }).then(() => {
    logger.info(`table 'Label' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createPostLabelRelationTable() {
  if (await db.schema.hasTable('Post_Label_Relation')) return;
  return await db.schema.createTable(`Post_Label_Relation`, table => {
    table.increments('id').primary();
    table.string('post_id').references('Post.id').onDelete('CASCADE');
    table.integer('label_id').references('Label.id').onDelete('CASCADE');
  }).then(() => {
    logger.info(`table 'Post_Label_Relation' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createArticalTable() {
  if (await db.schema.hasTable('Article')) return;
  return await db.schema.createTable('Article', table => {
    table.increments('id').primary();
    table.string('route');
    table.string('short_name');
    table.string('title');
    table.text('content').nullable();
    table.text('url').nullable();
    table.dateTime('create_at');
    table.dateTime('update_at');
    table.integer('bg_url').nullable();
    table.string('bg_color').nullable();
  }).then(() => {
    logger.info(`table 'Article' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createUserTable() {
  if (await db.schema.hasTable('User')) return;
  return await db.schema.createTable('User', table => {
    table.increments('id').primary();
    table.string('user_name');
    // table.string('email');
    table.string('password');
  }).then(() => {
    logger.info(`table 'User' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createViewHistory() {
  if (await db.schema.hasTable('View_History')) return;
  return await db.schema.createTable('View_History', table => {
    table.increments('id').primary();
    table.uuid('post_id').nullable();
    table.integer('article_id').nullable();
    table.dateTime('create_at');
  }).then(() => {
    logger.info(`table 'View_History' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

// export async function createRoleTable() {
//   if (await db.schema.hasTable('Role')) return;
//   return await db.schema.createTable('Role', table => {
//     table.increments('id').primary();
//     table.string('name');
//   }).then(() => {
//     logger.info(`table 'Role' 準備完了`);
//   }).catch(err => {
//     logger.error(err);
//   });
// }

// export async function createRightTable() {
//   if (await db.schema.hasTable('Right')) return;
//   return await db.schema.createTable('Right', table => {
//     table.increments('id').primary();
//     table.string('name');
//   }).then(() => {
//     logger.info(`table 'Right' 準備完了`);
//   }).catch(err => {
//     logger.error(err);
  // });
// }

// export async function createUserRoleRelationTable() {
//   if (await db.schema.hasTable('User_Role_Relation')) return;
//   return db.schema.createTable('User_Role_Relation', table => {
//     table.increments('id').primary();
//     table.integer('user_id').references('User.id').onDelete('CASCADE');
//     table.integer('role_id').references('Role.id').onDelete('CASCADE')
//   }).then(() => {
//     logger.info(`table 'User_Role_Relation' 準備完了`);
//   }).catch(err => {
//     logger.error(err);
//   });
// }

// export async function createRoleRightRelationTable() {
//   if (await db.schema.hasTable('Role_Right_Relation')) return;
//   return db.schema.createTable('Role_Right_Relation', table => {
//     table.increments('id').primary();
//     table.integer('role_id').references('Role.id').onDelete('CASCADE');
//     table.integer('right_id').references('Right.id').onDelete('CASCADE');
//   }).then(() => {
//     logger.info(`table 'Role_Right_Relation' 準備完了`);
//   }).catch(err => {
//     logger.error(err);
//   });
// }

export async function createAllTables() {
  return await Promise.all([
    createPostTable(),
    createCategoryTable(),
    createLabelTable(),
    createPostLabelRelationTable(),
    createArticalTable(),
    createUserTable(),
    createViewHistory()
  ]).then(() => {
    logger.info('全ての tables 準備完了');
  }).catch(err => {
    logger.error(err);
  });
}