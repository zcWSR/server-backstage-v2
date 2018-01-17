require('babel-core/register');
const { createPostTables, db } = require('./db');
const PostService = require('./service/postService');
const postJson = require('./post.json');

// createPostTables();
PostService.insertOne(postJson[0]);
