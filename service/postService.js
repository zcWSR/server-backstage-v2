import uuid from 'uuid/v1';
const Log = require('log');

import { db } from '../db';
import { queryOne } from './imageService';

const logger = new Log('postService');

/**
 * 插入一条
 * @param {{ title: string, date: string, category: string, labels: string[], section: string, rest: string, imageId }} post 文章对象
 */
export async function insertOne (post) {
  let postId = uuid();
  let cateId = await queryOrInsertOneCate(post.category);

  for(let label of post.labels) {
    await insertOneLabel(label, postId);
  }
  
  await db('Post').insert({
    id: postId,
    title: post.title,
    date: post.date,
    section: post.section,
    rest: post.rest,
    cate_id: cateId,
    image_id: post.imageId
  });
  logger.info(`新建文章完成, id: ${postId}`);
  // sql并行会数据不同步
  // let labelPromises = post.labels.map(label => insertOneLabel(label, postId));
  // return await Promise.all(labelPromises);
}

/**
 * 插入多条
 * @param {[{title: string, date: string, category: string, labels: string[], section: string, rest: string}]} posts 
 */
export async function insertSome (posts) {
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
export async function insertOneLabel (labelName, postId) {
  labelName = labelName.toLocaleLowerCase();
  let labelFromDB = await db('Label').first('id').where('name', labelName);
  let labelId;
  if (labelFromDB) {
    logger.info(`label: ${labelName} 存在, id: ${labelFromDB.id}`);
    labelId = labelFromDB.id;
  } else {
    labelId = await db('Label').insert({ name: labelName });
    labelId = parseInt(labelId);
    logger.info(`label: ${labelName} 不存在, 新 id: ${labelId}`);
  }
  logger.info(`写入 label 关系表: ${JSON.stringify({
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
export async function queryOrInsertOneCate (cateName) {
  let categoryFromDB = await db('Category').first('id').where('name', cateName);
  if (categoryFromDB) {
    logger.info(`cate: ${cateName} 存在, id: ${categoryFromDB.id}`);
    return categoryFromDB.id;
  } else {
    let cateId = await db('Category').insert({ name: cateName });
    logger.info(`cate: ${cateName} 不存在, 新 id: ${cateId}`)
    return parseInt(cateId);
  }
}

/**
 *  通过id查找文章全信息
 * @param {string} id 文章id
 */
export async function queryOneById (id) {
  let rows = await db.raw(
    `select p.id as id, p.title as title, p.date as date, p.section as section, p.rest as rest, c.name as category, group_concat(l.name, ',') as labels, i.url as background_url, i.main_color as main_color
      from (select * from Post where Post.id = '${id}') as p
      left join Post_Label_Relation pl on p.id = pl.post_id
      left join Label l on l.id = pl.label_id
      left join Category c on c.id = p.cate_id
      left join Image i on i.id = p.image_id`
  );

  if (!rows.length) return null;

  const post = rows[0];
  post.labels = post.labels ? post.labels.split(',') : []
  return post;
}

/**
 * 查找一部分博文，页大小 = 5
 * @param {number} page 页
 */
export async function querySome (page, pageSize) {
  let rows = await db.raw(
    `select p.id as id, p.title as title, p.date as date, p.section as section, c.name as category, group_concat(l.name, ',') as labels
      from (select * from Post order by Post.date desc limit ${pageSize} offset ${(page - 1) * pageSize}) as p
      left join Post_Label_Relation pl on p.id = pl.post_id
      left join Label l on l.id = pl.label_id
      left join Category c on c.id = p.cate_id
      group by p.id
      order by p.date desc`
  );

  return rows.map(item => {
    item.labels = item.labels ? item.labels.split(',') : []
    return item;
  });
} 

/**
 * 
 * @param {string} title 文章title关键词
 * @param {number} page 页
 * @param {number} pageSize 每页大小
 */
export async function queryByTitle (title, page, pageSize) {
  let rows = await db.raw(
    `select p.id as id, p.title as title, p.date as date, p.section as section, c.name as category, group_concat(l.name, ',') as labels
      from (select * from Post where Post.title like '%${title}%' order by Post.date desc limit ${pageSize} offset ${(page - 1) * pageSize}) as p
      left join Post_Label_Relation pl on p.id = pl.post_id
      left join Label l on l.id = pl.label_id
      left join Category c on c.id = p.cate_id
      group by p.id
      order by p.date desc`
  );

  return rows.map(item => {
    item.labels = item.labels ? item.labels.split(',') : []
    return item;
  });
}

/**
 * 
 * @param {string} cate 文章cate关键词
 * @param {number} page 页
 * @param {number} pageSize 每页大小
 */
export async function queryByCate (cate, page, pageSize) {
  let rows = await db.raw(
    `select p.id as id, p.title as title, p.date as date, p.section as section, c.name as category, group_concat(l.name, ',') as labels
      from Post p
      left join Post_Label_Relation pl on p.id = pl.post_id
      left join Label l on l.id = pl.label_id
      inner join (select * from Category where Category.name like '%${cate}%') as c on c.id = p.cate_id
      group by p.id
      order by p.date desc
      limit ${pageSize} offset ${(page - 1) * pageSize}`
  );

  return rows.map(item => {
    item.labels = item.labels ? item.labels.split(',') : []
    return item;
  });
}

/**
 * 
 * @param {string} label 文章label关键词
 * @param {number} page 页
 * @param {number} pageSize 每页大小
 */
export async function queryByLabel (label, page, pageSize) {
  let rows = await db.raw(
    `select p.id as id, p.title as title, p.date as date, p.section as section, c.name as category, group_concat(l.name , ',') as labels
      from (
        select p.*
        from Post p
          left join Post_Label_Relation pl on pl.post_id = p.id
          inner join Label l on l.id = pl.label_id and l.name like '%${label}%' group by p.id
      ) as p
      left join Post_Label_Relation pl on p.id = pl.post_id
      left join Label l on l.id = pl.label_id 
      left join Category c on c.id = p.cate_id
      group by p.id
      order by p.date desc
      limit ${pageSize} offset ${(page - 1) * pageSize}`
  );


}

export async function countAllPost () {
  let data = await db('Post').count('id as count').first();
  return data.count;
}

export async function deletePostById(id) {
  return await db('Post').where('id', id).del();
}


// ===================Label Category 相关 ===================

export async function queryAllCates () {
  let rows = await db('Category').select('name');
  return rows.reduce((prev, cur) => {
    if (cur.name !== ' ')
      prev.push(cur.name);
    return prev;
  }, []);
}

export async function queryAllCatesWithCount () {
  return await db('Category')
                .select('Category.name').as('category')
                .count('Post.cate_id as count')
                .innerJoin('Post', function () {
                  this.on('Post.cate_id', '=', 'Category.id')
                })
              .groupBy('Category.id');
}

export async function queryAllLabels () {
  let rows = await db('Label').select('name');
  return rows.reduce((prev, cur) => {
    if (cur.name !== ' ')
      prev.push(cur.name);
    return prev;
  }, []);
}

export async function queryAllLabelsWithCount () {
  let rows = await db('Label')
                .select('Label.name').as('label')
                .count('Post_Label_Relation.post_id as count')
                .innerJoin('Post_Label_Relation', function () {
                  this.on('Post_Label_Relation.label_id', '=', 'Label.id')
                })
              .groupBy('Label.id');
  return rows.filter(item => item.name !== ' ');
}

