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
    await db.schema.createTableIfNotExists(`Post`, table => {
        table.uuid('id').primary();
        table.string('title');
        table.dateTime('date');
        table.text('section');
        table.text('rest');
    }).catch(err => {
        console.log(err);
    });
    
    await db.schema.createTableIfNotExists(`Category`, table => {
        table.increments('id').primary();
        table.string('name');
    }).catch(err => {
        console.log(err);
    });

    await db.schema.createTableIfNotExists(`Post_Category_Relation`, table => {
        table.increments('id').primary();
        table.string('post_id');
        table.integer('cate_id');
        table.foreign('post_id').references('Post.id').onDelete('CASCADE');
    }).catch(err => {
        console.log(err);
    });
    
    await db.schema.createTableIfNotExists(`Label`, table => {
        table.increments('id').primary();
        table.string('name');
    }).catch(err => {
        console.log(err);
    });

    await db.schema.createTableIfNotExists(`Post_Label_Relation`, table => {
        table.increments('id').primary();
        table.string('post_id');
        table.integer('label_id');
        table.foreign('post_id').references('Post.id').onDelete('CASCADE');
    }).catch(err => {
        console.log(err);
    });
}