import uuid from 'uuid/v1';
import moment from 'moment';
import { createAllTables, db } from '../db';
import { insertSome } from '../service/postService';
const json = require('./posts.json');

const imgList = [];

(async () => {
  await createAllTables();
  await initPostData();
  await initBlogConfig();
  process.exit();
})();

async function initPostData () {
  const posts = json.data.list.map(item => {
    const date = moment(item.date).toDate();
    item.createAt = date;
    item.updateAt = date;
    return item;
  });
  await insertSome(posts.reverse());
}


async function initBlogConfig() {
  await db('Blog_Config').insert({ id: 1 });
}