import uuid from 'uuid/v1';
import { insertSome } from '../service/postService';
import { createAllTables } from '../db';
const json = require('./posts.json');

(async () => {
  await createAllTables();
  insertSome(json.data.list.reverse());
})();
