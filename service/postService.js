import uuid from 'uuid/v1';
const Log = require('log');

import { db } from '../db';
import { queryOne } from './imageService';

const logger = new Log('postService');

/**
 * 插入一条
 * @param {{ title: string, createAt: string, updateAt: string, category: string, labels: string[], section: string, rest: string, bgColor, bgUrl }} post 文章对象
 */
export async function insertOne(post) {
  let postId = uuid();
  let cateId = await queryOrInsertOneCate(post.category);

  for (let label of post.labels) {
    await insertOneLabel(label, postId);
  }

  await db('Post').insert({
    id: postId,
    title: post.title,
    create_at: post.createAt,
    update_at: post.updateAt,
    section: post.section,
    rest: post.rest,
    cate_id: cateId,
    bg_color: post.bgColor,
    bg_url: post.bgUrl
  });
  logger.info(`新建博文完成, id: ${postId}`);
  // sql并行会数据不同步
  // let labelPromises = post.labels.map(label => insertOneLabel(label, postId));
  // return await Promise.all(labelPromises);
}

/**
 * 插入一条
 * @param {{ title: string, category: string, labels: string[], content: string, bgColor, bgUrl }} post 文章对象
 */
export async function uploadOne(post) {
  let postId = uuid();
  let cateId = await queryOrInsertOneCate(post.category);

  for (let label of post.labels) {
    await insertOneLabel(label, postId);
  }

  const split = post.content.split(/\n\s*<!--\s*more\s*-->\s*\n/i);
  const section = split[0];
  const rest = split[1] || ''

  await db('Post').insert({
    id: postId,
    title: post.title,
    create_at: new Date().getTime(),
    update_at: new Date().getTime(),
    section,
    rest,
    cate_id: cateId,
    bg_color: post.bgColor,
    bg_url: post.bgUrl
  });
  logger.info(`新建博文完成, id: ${postId}`);
  // sql并行会数据不同步
  // let labelPromises = post.labels.map(label => insertOneLabel(label, postId));
  // return await Promise.all(labelPromises);
}

/**
 * 插入多条
 * @param {[{title: string, createAt: string, updateAt: string, category: string, labels: string[], section: string, rest: string}]} posts
 */
export async function insertSome(posts) {
  for (let post of posts) {
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
export async function insertOneLabel(labelName, postId) {
  labelName = labelName.toLocaleLowerCase();
  let labelFromDB = await db('Label')
    .first('id')
    .where('name', labelName);
  let labelId;
  if (labelFromDB) {
    logger.info(`label: ${labelName} 存在, id: ${labelFromDB.id}`);
    labelId = labelFromDB.id;
  } else {
    labelId = await db('Label').insert({ name: labelName });
    labelId = parseInt(labelId);
    logger.info(`label: ${labelName} 不存在, 新 id: ${labelId}`);
  }
  logger.info(
    `写入 label 关系表: ${JSON.stringify({
      post_id: postId,
      label_id: labelId
    })}`
  );
  await db('Post_Label_Relation').insert({
    post_id: postId,
    label_id: labelId
  });
}

/**
 * 查询或新加一个类别
 * @param {string} cateName 类别名
 */
export async function queryOrInsertOneCate(cateName) {
  let categoryFromDB = await db('Category')
    .first('id')
    .where('name', cateName);
  if (categoryFromDB) {
    logger.info(`cate: ${cateName} 存在, id: ${categoryFromDB.id}`);
    return categoryFromDB.id;
  } else {
    let cateId = await db('Category').insert({ name: cateName });
    logger.info(`cate: ${cateName} 不存在, 新 id: ${cateId}`);
    return parseInt(cateId);
  }
}

/**
 *  通过id查找文章全信息
 * @param {string} id 文章id
 */
export async function queryOneById(id) {
  let rows = await db.raw(
    `select
      p.id as id,
      p.title as title,
      p.create_at as createAt,
      p.update_at as updateAt,
      p.section as section,
      p.rest as rest,
      p.lock as lock,
      c.name as category,
      group_concat(l.name, ',') as labels,
      p.bg_url as bgUrl,
      p.bg_color as bgColor
        from (select * from Post where Post.id = '${id}') as p
        left join Post_Label_Relation pl on p.id = pl.post_id
        left join Label l on l.id = pl.label_id
        left join Category c on c.id = p.cate_id`
  );

  if (!rows.length) return null;

  const post = rows[0];
  post.labels = post.labels ? post.labels.split(',') : [];
  post.lock = !!post.lock;
  return post;
}

/**
 * 查找一部分博文，页大小 = 5
 * @param {number} page 页
 */
export async function querySome(page, pageSize, withLock = false) {
  let section = '';
  if (withLock) {
    section = `from (select * from Post order by Post.create_at desc limit ${pageSize} offset ${(page -
      1) *
      pageSize}) as p`;
  } else {
    section = `from (select * from Post where lock = 0 order by Post.create_at desc limit ${pageSize} offset ${(page -
      1) *
      pageSize}) as p`;
  }
  let rows = await db.raw(
    `select
      p.id as id,
      p.title as title,
      p.create_at as createAt,
      p.update_at as updateAt,
      p.section as section,
      p.lock as lock,
      c.name as category,
      group_concat(l.name, ',') as labels
        ${section}
        left join Post_Label_Relation pl on p.id = pl.post_id
        left join Label l on l.id = pl.label_id
        left join Category c on c.id = p.cate_id
        group by p.id
        order by p.create_at desc`
  );

  return rows.map(item => {
    item.labels = item.labels ? item.labels.split(',') : [];
    return item;
  });
}

/**
 * 查找一部分博文, 根据题目，页大小 = 5
 * @param {number} page 页
 */
export async function querySomeByTitle(page, pageSize, title, withLock = false) {
  let section = '';
  if (withLock) {
    section = `from (select * from Post where title like '%${title}%' order by Post.create_at desc limit ${pageSize} offset ${(page -
      1) *
      pageSize}) as p`;
  } else {
    section = `from (select * from Post where lock = 0 and title like '%${title}%' order by Post.create_at desc limit ${pageSize} offset ${(page -
      1) *
      pageSize}) as p`;
  }
  let rows = await db.raw(
    `select
      p.id as id,
      p.title as title,
      p.create_at as createAt,
      p.update_at as updateAt,
      p.section as section,
      p.lock as lock,
      c.name as category,
      group_concat(l.name, ',') as labels
        ${section}
        left join Post_Label_Relation pl on p.id = pl.post_id
        left join Label l on l.id = pl.label_id
        left join Category c on c.id = p.cate_id
        group by p.id
        order by p.create_at desc`
  );

  return rows.map(item => {
    item.labels = item.labels ? item.labels.split(',') : [];
    return item;
  });
}

/**
 *
 * @param {string} title 文章title关键词
 * @param {number} page 页
 * @param {number} pageSize 每页大小
 */
export async function queryByTitle(title, page, pageSize, withLock = false) {
  let section = '';
  if (withLock) {
    section = `from (select * from Post where Post.title like '%${title}%' order by Post.create_at desc limit ${pageSize} offset ${(page -
      1) *
      pageSize}) as p`;
  } else {
    section = `from (select * from Post where Post.title like '%${title}%' and lock = 0 order by Post.create_at desc limit ${pageSize} offset ${(page -
      1) *
      pageSize}) as p`;
  }

  let rows = await db.raw(
    `select
      p.id as id,
      p.title as title,
      p.create_at as createAt,
      p.update_at as updateAt,
      c.name as category,
      group_concat(l.name, ',') as labels
        ${section}
        left join Post_Label_Relation pl on p.id = pl.post_id
        left join Label l on l.id = pl.label_id
        left join Category c on c.id = p.cate_id
        group by p.id
        order by p.create_at desc`
  );

  return rows.map(item => {
    item.labels = item.labels ? item.labels.split(',') : [];
    return item;
  });
}

/**
 *
 * @param {string} cate 文章cate关键词
 * @param {number} page 页
 * @param {number} pageSize 每页大小
 */
export async function queryByCate(cate, page, pageSize, withLock = false) {
  let section = '';
  if (withLock) {
    section = 'left join Post_Label_Relation pl on p.id = pl.post_id';
  } else {
    section = `left join Post_Label_Relation pl on p.id = pl.post_id and p.lock = 0`;
  }
  let rows = await db.raw(
    `select
      p.id as id,
      p.title as title,
      p.create_at as createAt,
      p.update_at as updateAt,
      c.name as category,
      group_concat(l.name, ',') as labels
        from Post p
        ${section}
        left join Label l on l.id = pl.label_id
        inner join (select * from Category where Category.name like '%${cate}%') as c on c.id = p.cate_id
        group by p.id
        order by p.create_at desc
        limit ${pageSize} offset ${(page - 1) * pageSize}`
  );

  return rows.map(item => {
    item.labels = item.labels ? item.labels.split(',') : [];
    return item;
  });
}

/**
 *
 * @param {string} label 文章label关键词
 * @param {number} page 页
 * @param {number} pageSize 每页大小
 */
export async function queryByLabel(label, page, pageSize, withLock = false) {
  let section = '';
  if (withLock) {
    section = `left join Post_Label_Relation pl on pl.post_id = p.id`;
  } else {
    section = `left join Post_Label_Relation pl on pl.post_id = p.id and p.lock = 0`;
  }
  let rows = await db.raw(
    `select
      p.id as id,
      p.title as title,
      p.create_at as createAt,
      p.update_at as updateAt,
      c.name as category,
      group_concat(l.name , ',') as labels
        from (
          select p.*
          from Post p
            ${section}
            inner join Label l on l.id = pl.label_id and l.name like '%${label}%' group by p.id
        ) as p
        left join Post_Label_Relation pl on p.id = pl.post_id
        left join Label l on l.id = pl.label_id 
        left join Category c on c.id = p.cate_id
        group by p.id
        order by p.create_at desc
        limit ${pageSize} offset ${(page - 1) * pageSize}`
  );

  return rows.map(item => {
    item.labels = item.labels ? item.labels.split(',') : [];
    return item;
  });
}

/**
 * 为文章上锁或去锁
 * @param {string} id 文章id
 * @param {boolean} lock 是否锁定
 */

export async function lockOrUnLock(id, lock) {
  return await db('Post').update('lock', lock ? 1 : 0).where('id', id);
}

/**
 * 获取总文章数
 */
export async function countAllPost() {
  let data = await db('Post')
    .count('id as count')
    .first();
  return data.count;
}

/**
 * 带标题计数
 * @param {string} title 标题
 */
export async function countWithTitle(title) {
  let data = await db('Post')
  .count('id as count')
  .where('title', 'like', `%${title}%`)
  .first();
  return data.count;
}

/**
 * 删除文章
 * @param {string} id 文章id
 */
export async function deletePostById(id) {
  return await db('Post')
    .where('id', id)
    .del();
}

// ===================Label Category 相关 ===================

/**
 * 查询所有类别
 */
export async function queryAllCates() {
  let rows = await db('Category').select('name');
  return rows.reduce((prev, cur) => {
    if (cur.name !== ' ') prev.push(cur.name);
    return prev;
  }, []);
}

/**
 * 查询所有类别带计数
 */
export async function queryAllCatesWithCount() {
  return await db('Category')
    .select('Category.name')
    .as('category')
    .count('Post.cate_id as count')
    .innerJoin('Post', function() {
      this.on('Post.cate_id', '=', 'Category.id');
    })
    .groupBy('Category.id');
}

/**
 *  查询所有标签
 */
export async function queryAllLabels() {
  let rows = await db('Label').select('name');
  return rows.reduce((prev, cur) => {
    if (cur.name !== ' ') prev.push(cur.name);
    return prev;
  }, []);
}

/**
 * 查询所有标签带计数
 */
export async function queryAllLabelsWithCount() {
  let rows = await db('Label')
    .select('Label.name')
    .as('label')
    .count('Post_Label_Relation.post_id as count')
    .innerJoin('Post_Label_Relation', function() {
      this.on('Post_Label_Relation.label_id', '=', 'Label.id');
    })
    .groupBy('Label.id');
  return rows.filter(item => item.name !== ' ');
}

/**
 * 添加浏览历史记录
 * @param {string} id 文章id
 */
export async function addViewHistory(id) {
  await db('View_History').insert({
    post_id: id,
    create_at: new Date()
  });
}
