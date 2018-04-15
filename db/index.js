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

// export const bs = bookshelf(db);

// export const Post = bs.Model.extend({
//   tableName: 'Post',
//   category: function () { return this.belongsTo(Category); },
//   labels: function () { return this.belongsToMany(Label); },
//   background: function () { return this.belongsTo(Image); }
// });

// export const Category = bs.Model.extend({
//   tableName: 'Category',
//   posts: function () { this.hasMany(Post); }
// });

// export const Label = bs.Model.extend({
//   tableName: 'Label',
//   posts: function () { return this.belongsToMany(Post); }
// });

// export const Image = bs.Model.extend({
//   tableName: 'Image'
// });

// export const User = bs.Model.extend({
//   tableName: 'User',
//   roles: function () { return this.belongsToMany(Role); }
// });

// // 角色
// export const Role = bs.Model.extend({
//   tableName: 'Role',
//   users: function () { return this.belongsToMany(User); },
//   rights: function () { return this.belongsToMany(Right); }
// });

// // 权限
// export const Right = bs.Model.extend({
//   tableName: 'Right',
//   roles: function () { return this.belongsToMany(Role) }
// });

export async function createPostTable() {
  if (await db.schema.hasTable('Post')) return;
  return await db.schema.createTable(`Post`, table => {
    table.uuid('id').primary();
    table.string('title');
    table.dateTime('date');
    table.text('section');
    table.text('rest');
    table.integer('cate_id').references('Category.id');
    table.integer('image_id').nullable().references('Image.id');
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
  }).catch(err => {``
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

export async function createImageTable() {
  if (await db.schema.hasTable('Image')) return;
  return await db.schema.createTable('Image', table => {
    table.increments('id').primary();
    table.string('name').nullable();
    table.text('url');
    table.string('main_color');
  }).then(() => {
    logger.info(`table 'Image' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createUserTable() {
  if (await db.schema.hasTable('User')) return;
  return await db.schema.createTable('User', table => {
    table.increments('id').primary();
    table.string('user_name').nullable();
    table.string('email');
    table.string('password');
  }).then(() => {
    logger.info(`table 'User' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createRoleTable() {
  if (await db.schema.hasTable('Role')) return;
  return await db.schema.createTable('Role', table => {
    table.increments('id').primary();
    table.string('name');
  }).then(() => {
    logger.info(`table 'Role' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createRightTable() {
  if (await db.schema.hasTable('Right')) return;
  return await db.schema.createTable('Right', table => {
    table.increments('id').primary();
    table.string('name');
  }).then(() => {
    logger.info(`table 'Right' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createUserRoleRelationTable() {
  if (await db.schema.hasTable('User_Role_Relation')) return;
  return db.schema.createTable('User_Role_Relation', table => {
    table.increments('id').primary();
    table.integer('user_id').references('User.id').onDelete('CASCADE');
    table.integer('role_id').references('Role.id').onDelete('CASCADE')
  }).then(() => {
    logger.info(`table 'User_Role_Relation' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createRoleRightRelationTable() {
  if (await db.schema.hasTable('Role_Right_Relation')) return;
  return db.schema.createTable('Role_Right_Relation', table => {
    table.increments('id').primary();
    table.integer('role_id').references('Role.id').onDelete('CASCADE');
    table.integer('right_id').references('Right.id').onDelete('CASCADE');
  }).then(() => {
    logger.info(`table 'Role_Right_Relation' 準備完了`);
  }).catch(err => {
    logger.error(err);
  });
}

export async function createAllTables() {
  return await Promise.all([
    createPostTable(),
    createCategoryTable(),
    createLabelTable(),
    createPostLabelRelationTable(),
    createImageTable(),
    createUserTable(),
    createRoleTable(),
    createRightTable(),
    createUserRoleRelationTable(),
    createRoleRightRelationTable()
  ]).then(() => {
    logger.info('全ての tables 準備完了');
  }).catch(err => {
    logger.error(err);
  });
}