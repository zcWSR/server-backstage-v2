const uuid = require('uuid/v1');
const moment = require('moment');

const db = require('../db').db;

const pageSize = 5;
/**
 * 插入一条
 * @param {{ title: string, date: string, categories: string[], labels: string[], section: string, rest: string }} post 文章对象
 */
async function insertOne (post) {
  let postId = uuid();
  let cateId = await queryOrInsertOneCate(post.categories[0]);

  if (!post.labels.length) {
    post.labels = [' '];
  }
  
  for(let label of post.labels) {
    await insertOneLabel(label, postId);
  }
  
  await db('Post').insert({
    id: postId,
    title: post.title,
    date: post.date,
    section: post.section,
    rest: post.rest,
    cate_id: cateId
  });
  console.log(`新建文章完成, id: ${postId}`)
  // sql并行会数据不同步
  // let labelPromises = post.labels.map(label => insertOneLabel(label, postId));
  // return await Promise.all(labelPromises);
}

/**
 * 插入多条
 * @param {[{title: string, date: string, categories: string[], labels: string[], section: string, rest: string}]} posts 
 */
async function insertSome (posts) {
  for(let post of posts) {
    await insertOne(post);
  }
  // sql并行会出现数据不同步
  // let promises = posts.map(post => insertOne(post));
  // return await Promise.all(promises);
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
    console.log(`label: ${labelName} 存在, id: ${labelFromDB.id}`)
    labelId = labelFromDB.id;
  } else {
    labelId = await db('Label').insert({ name: labelName });
    labelId = parseInt(labelId);
    console.log(`label: ${labelName} 不存在, 新 id: ${labelId}`)
  }
  console.log(`写入 label 关系表: ${JSON.stringify({
    post_id: postId,
    label_id: labelId
  })}`);
  await db('Post_Label_Relation').insert({
    post_id: postId,
    label_id: labelId
  });
}

/**
 * 查询或新加一个类别
 * @param {string} cateName 类别名
 */
async function queryOrInsertOneCate (cateName) {
  let categoryFromDB = await db('Category').first('id').where('name', cateName);
  if (categoryFromDB) {
    console.log(`cate: ${cateName} 存在, id: ${categoryFromDB.id}`)
    return categoryFromDB.id;
  } else {
    let cateId = await db('Category').insert({ name: cateName });
    console.log(`cate: ${cateName} 不存在, 新 id: ${cateId}`)
    return parseInt(cateId);
  }
}

async function queryOneById (id) {
  let rows = await db.raw(
    `select Post.id, Post.title, Post.date, Post.section, Post.rest, Label.name as label, Category.name as category from Post 
      inner join Post_Label_Relation, Label, Category 
          on
              Post.id = "${id}" AND
              Post_Label_Relation.post_id = "${id}" AND
              Post_Label_Relation.label_id = Label.id AND
              Category.id = Post.cate_id`
  );

  if (!rows.length) return null;

  return rows.reduce((prev, cur) => {
    if (!prev) {
      prev = {
        _id: cur.id,
        title: cur.title,
        date: cur.date,
        section: cur.section,
        rest: cur.rest,
        categories: [cur.category],
        labels: cur.label === ' ' ? [] : [cur.label]
      };
    } else {
      prev.labels.push(cur.label);
    }

    return prev;
  }, null);
}

/**
 * 查找一部分博文，页大小 = 5
 * @param {number} page 页
 */
async function querySome (page) {
  let rows = await db.raw(
    `select Post.id, Post.title, Post.date, Post.section, Post.rest, Label.name as label, Category.name as category from Post 
      inner join Post_Label_Relation, Label, Category 
          on
              Post_Label_Relation.post_id = Post.id 
              where Post.id 
                  in (select id from Post order by Post.date desc limit ${pageSize} offset ${(page - 1) * pageSize}) AND
              Post_Label_Relation.label_id = Label.id AND
              Category.id = Post.cate_id
    order by Post.date desc`
  );

  return rows.reduce((prev, cur) => {
    if (!prev.length || prev[prev.length - 1].id !== cur.id) {
      prev.push({
        _id: cur.id,
        title: cur.title,
        date: cur.date,
        section: cur.section,
        rest: cur.rest,
        categories: [cur.category],
        labels: cur.label === ' ' ? [] : [cur.label]
      });
    } else {
      prev[prev.length - 1].labels.push(cur.label);
    }
    return prev;
  }, []);
} 

async function countAllPost () {
  let data = await db('Post').count('id').first();
  return data['count(`id`)'];
}

async function queryAllCates () {
  let rows = await db('Category').select('name');
  return rows.reduce((prev, cur) => {
    if (cur.name !== ' ')
      prev.push(cur.name);
    return prev;
  }, []);
}

async function queryAllLabels () {
  let rows = await db('Label').select('name');
  return rows.reduce((prev, cur) => {
    if (cur.name !== ' ')
      prev.push(cur.name);
    return prev;
  }, []);
}

module.exports = {
  insertOne,
  insertSome,
  queryOneById,
  querySome,
  countAllPost,
  queryAllCates,
  queryAllLabels,
}