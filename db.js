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

module.exports.db = db;

module.exports.createPostTables = async () => {
    await db.schema.createTableIfNotExists('post', table => {
        console.log('create post table');
        table.string('id').primary();
        table.string('title');
        table.dateTime('date');
        table.text('section');
        table.text('rest');
    });
    
    await db.schema.createTableIfNotExists('category', table => {
        console.log('create category table');
        table.increments('id').primary();
        table.string('name');
        table.integer('post_id');
    });
    
    await db.schema.createTableIfNotExists('label', table => {
        console.log('create label table');
        table.increments('id').primary();
        table.string('name');
        table.integer('post_id');
    });
}