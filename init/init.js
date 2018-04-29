import uuid from 'uuid/v1';
import moment from 'moment';
import { createAllTables } from '../db';
import { insertSome } from '../service/postService';
import { queryOneById } from '../service/articleService';
const json = require('./posts.json');

const imgList = [];

(async () => {
  await createAllTables();
  await initPostData();

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


async function initImgData () {
  
}