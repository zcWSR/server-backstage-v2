require('babel-core/register');
const createPostTables = require('./db').createPostTables;
const PostService = require('./service/postService');
const postJson = require('./post.json');
createPostTables();
PostService.insertSome(postJson);

