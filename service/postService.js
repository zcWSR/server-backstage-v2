const uuid = require('uuid/v1');
const moment = require('moment');

const db = require('../db').db;
/**
 * 插入一条
 * @param {{ title: string, date: string, categories: string[], labels: string[], section: string, rest: string }} post 文章对象
 */
async function insertOne (post) {
  let postId = uuid();
  await db('post').insert({
    id: postId,
    title: post.title,
    date: moment(post.dateTime).toDate(),
    section: post.section,
    rest: post.rest
  });

  await insertOneLabel(post.labels[0], postId);
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

/**
 * 插入一个标签
 * @param {string} labelName 标签名
 * @param {string} postId 文章id
 */
async function insertOneLabel (labelName, postId) {
  labelName = labelName.toLocaleLowerCase();
  let data = await db('Label').select('id').where('name', labelName);
  console.log(data);
}

/**
 * 插入一个类别
 * @param {string} cateName 类别名
 * @param {string} postId 文章id
 */
async function insertOneCate (cateName, postId) {

}


module.exports = {
  insertOne,
  insertSome,
  
}