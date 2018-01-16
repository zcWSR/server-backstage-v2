const uuid = require('uuid/v1');
const moment = require('moment');

const db = require('../db').db;
/**
 * 插入一条
 * @param {{title: string, date: string, categories: string[], labels: string[], section: string, rest: string}} post 文章对象
 */
async function insertOne (post) {
  let id = uuid();
  return db('post').insert({
    id: id,
    title: post.title,
    date: moment(post.dateTime).toDate(),
    section: post.section,
    rest: post.rest
  });
}

/**
 * 插入多条
 * @param {[{title: string, date: string, categories: string[], labels: string[], section: string, rest: string}]} posts 
 */
async function insertSome (posts) {
  for(let post of posts) {
    await insertOne(post);
  }
}




module.exports = {
  insertOne,
  insertSome,
  
}