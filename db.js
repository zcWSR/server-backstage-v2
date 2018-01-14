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

db.schema.createTableIfNotExists('post', table => {
    console.log('create post');
    table.increments('id').primary();
    table.string('title');
    table.dateTime('date');
    table.string('section');
    table.string('rest');
});

db.schema.createTableIfNotExists('category', table => {
    console.log('create category');
    table.increments('id').primary();
    table.string('name');
    table.integer('post_id');
});

db.schema.createTableIfNotExists('label', table => {
    console.log('create label');
    table.increments('id').primary();
    table.string('name');
    table.integer('post_id');
});

module.exports = db;

