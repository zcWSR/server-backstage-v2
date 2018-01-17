require('babel-core/register');
const { createPostTables, db } = require('./db');
const PostService = require('./service/postService');
const postJson = require('./post-data');

createPostTables().then(() => {
    PostService.insertOne(postJson[0]);
});
