require('babel-core/register');
const fs = require('fs');
const path = require('path');
const { createPostTables, db } = require('./db');
const PostService = require('./service/postService');
const postJson = require('./post-data');

if(!fs.existsSync(path.resolve(__dirname, 'db.sqlite'))) {
    console.log('数据库文件不存在，创建之');
    createPostTables().then(() => {
        PostService.insertSome(postJson);
    });
}

// PostService.querySome(1).then(data => {
//     console.log(JSON.stringify(data, null, 2));
// });
