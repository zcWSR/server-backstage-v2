const uuid = require('uuid/v1');
const moment = require('moment');

const db = require('../db').db;
/**
 * 插入一条
 * @param {{title: string, date: string, categories: string[], labels: string[], section: string, rest: string}} post 文章对象
 */
async function insertOne (post) {
  let id = uuid();
  await db('post').insert({
    id: id,
    title: post.title,
    date: moment(post.dateTime).toDate(),
    section: post.section,
    rest: post.rest
  });
  
  let catePromises = 
    post.categories.map(cate => db('category', {
      name: cate,
      post_id: id
    }));

  let labelPromises = 
    post.labels.map(label => db('label', {
      name: label,
      id: id
    }));

  return await Promise.all(catePromises.concat(labelPromises)); 
}

/**
 * 插入多条
 * @param {[{title: string, date: string, categories: string[], labels: string[], section: string, rest: string}]} posts 
 */
async function insertSome (posts) {
  let promises = posts.map(post => insertOne(post));
  return await Promise.all(promises);
}

async function queryOneById (id) {
  let post = await db.select('*').from('post').where({ id: id });
  let 
}

module.exports = {
  insertOne,
  insertSome,
  
}