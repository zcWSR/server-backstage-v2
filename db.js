import os from 'os';
import fs from 'fs';
import path from 'path';
import knex from 'knex';

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
  return await db.schema.createTableIfNotExists(`Post`, table => {
    table.uuid('id').primary();
    table.string('title');
    table.dateTime('date');
    table.text('section');
    table.text('rest');
    table.integer('cate_id');
  }).then(() => {
    console.log(`table 'Post' 準備完了`)
  }).catch(err => {
    console.log(err);
  });
}

export async function createCategoryTable() {
  return await db.schema.createTableIfNotExists(`Category`, table => {
    table.increments('id').primary();
    table.string('name');
  }).then(() => {
    console.log(`table 'Category' 準備完了`);
  }).catch(err => {
    console.log(err);
  });
}

export async function createLabelTable() {
  return await db.schema.createTableIfNotExists(`Label`, table => {
    table.increments('id').primary();
    table.string('name');
  }).then(() => {
    console.log(`table 'Label' 準備完了`)
  }).catch(err => {
    console.log(err);
  });
}

export async function createPostLabelRelationTable() {
  return await db.schema.createTableIfNotExists(`Post_Label_Relation`, table => {
    table.increments('id').primary();
    table.string('post_id');
    table.integer('label_id');
    table.foreign('post_id').references('Post.id').onDelete('CASCADE');
  }).then(() => {
    console.log(`table 'Post_Label_Relation' 準備完了`);
  }).catch(err => {
    console.log(err);
  });
}

export async function createBlogTables() {
  return await Promise.all([
    createPostTable(),
    createCategoryTable(),
    createLabelTable(),
    createPostLabelRelationTable()
  ]).then(() => {
    console.log('全ての tables 準備完了');
  }).catch(err => {
    console.log(err);
  });
}