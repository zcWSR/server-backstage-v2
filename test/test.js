import uuid from 'uuid/v1';
import { createAllTables } from '../db';
import { insertSome } from '../service/postService';
import { queryOneById } from '../service/articleService';
const json = require('./posts.json');

(async () => {
  await createAllTables();
  const posts = json.data.list.map(item => {
    item.createAt = item.date;
    item.updateAt = item.date;
    return item;
  });
  await insertSome(posts.reverse());
  process.exit();
})();
