const uuid = require('uuid/v1');
const moment = require('moment');

const db = require('../db').db;
/**
 * 插入一条
 * @param {{ title: string, date: string, categories: string[], labels: string[], section: string, rest: string }} post 文章对象
 */
async function insertOne (post) {
  let postId = uuid();
  await db('Post').insert({
    id: postId,
    title: post.title,
    date: moment(post.dateTime).toDate(),
    section: post.section,
    rest: post.rest
  });

  let labelPromises = post.labels.map(label => insertOneLabel(label, postId));
  let categoryPromises = post.categories.map(cate => insertOneCate(cate, postId));
  return await Promise.all([...labelPromises, ... categoryPromises]);
}

/**
 * 插入多条
 * @param {[{title: string, date: string, categories: string[], labels: string[], section: string, rest: string}]} posts 
 */
async function insertSome (posts) {
  let promises = posts.map(post => insertOne(post));
  return await Promise.all(promises);
}

/**
 * 插入一个标签
 * @param {string} labelName 标签名
 * @param {string} postId 文章id
 */
async function insertOneLabel (labelName, postId) {
  labelName = labelName.toLocaleLowerCase();
  let labelFromDB = await db('Label').first('id').where('name', labelName);
  let labelId;
  if (labelFromDB) {
    labelId = labelFromDB.id;
  } else {
    labelId = await db('Label').insert({ name: labelName });
    labelId = parseInt(labelId);
  }
  await db('Post_Label_Relation').insert({
    post_id: postId,
    label_id: labelId
  });
}

/**
 * 插入一个类别
 * @param {string} cateName 类别名
 * @param {string} postId 文章id
 */
async function inserOneCate (categoryName, postId) {
  categoryName = categoryName.toLocaleLowerCase();
  let categoryFromDB = await db('Category').first('id').where('name', categoryName);
  let categoryId;
  if (categoryFromDB) {
    categoryId = categoryFromDB.id;
  } else {
    categoryId = await db('Category').insert({ name: categoryName });
    categoryName = parseInt(categoryName);
  }
  await db('Post_Category_Relation').insert({
    post_id: postId,
    cate_id: categoryId
  });
}

async function queryOneById (id) {
  return await db('Post');
}

async function qunerySome (page, pageSize) {
  return await db('Post');
} 


module.exports = {
  insertOne,
  insertSome,
  queryOneById,
  qunerySome,
}