const os = require('os');
const fs = require('fs');
const path = require('path');
const knex = require('knex');

// const projectDir = path.resolve(__dirname, '../');
const dbFilePath = path.resolve(__dirname, 'db.sqlite');
const db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbFilePath
  },
  useNullAsDefault: true
});


async function createPostTable() {
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

async function createCategoryTable() {
  return await db.schema.createTableIfNotExists(`Category`, table => {
    table.increments('id').primary();
    table.string('name');
  }).then(() => {
    console.log(`table 'Category' 準備完了`);
  }).catch(err => {
    console.log(err);
  });
}

async function createLabelTable() {
  return await db.schema.createTableIfNotExists(`Label`, table => {
    table.increments('id').primary();
    table.string('name');
  }).then(() => {
    console.log(`table 'Label' 準備完了`)
  }).catch(err => {
    console.log(err);
  });
}

async function createPostLabelRelationTable() {
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

async function createBlogTables() {
  return await Promise.all([
    createPostTable(),
    createCategoryTable(),
    createLabelTable(),
    createPostLabelRelationTable()
  ]).then(() => {
    console.log('全ての tables 準備完了');
  }).catch(err => {
    console.log(err);
  })
}

module.exports = {
  db,
  createPostTable,
  createCategoryTable,
  createLabelTable,
  createPostLabelRelationTable,
  createBlogTables
}