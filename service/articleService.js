const Log = require('log');

import { db } from '../db';
import moment from 'moment';

const logger = new Log('ArticleService');

/**
 * 通过id查询小文章
 * @param {number} id 小文章id
 */
export async function queryOneById(id) {
  const rows = await db.raw(
    `select
      a.id as id,
      a.route as route,
      a.short_name as shortName,
      a.title as title,
      a.content as content,
      a.url as url,
      a.create_at as createAt,
      a.lock as lock,
      a.bg_url as bgUrl,
      a.bg_color as bgColor
      from Article a
      where a.id = ${id}
  `);
    if (rows.length) {
      const article = rows[0];
      return article;
    }
    return null;
}

/**
 * 查询所有小文章
 */
export async function queryAll() {
  const rows = await db.rows(
    `select
      a.id as id,
      a.route as route,
      a.short_name as shortName,
      a.title as title,
      a.create_at as createAt,
      a.update_at as updateAt,
      a.lock as lock,
      from Article a
  `);
  return rows;
}
/**
 * 插入一条
 * @param {{ title: string, createAt: string, updateAt: string, category: string, labels: string[], section: string, rest: string, imageId }} article 小文章对象
 */
export async function insertOne(article) {
  const ids = await db('Article').insert({
    route: article.route,
    short_name: article.shortName,
    title: article.title,
    content: article.content,
    url: article.url,
    create_at: new Date().getTime(),
    update_at: new Date().getTime(),
    lock: article.lock,
    bg_url: article.bgUrl,
    bg_color: article.bgColor
  });
  logger.info(`新建文章完成, id: ${ids[0]}`);
}

/**
 * 
 * @param {number} id 小文章id
 * @param {{ title: string, createAt: string, updateAt: string, category: string, labels: string[], section: string, rest: string, imageId }} a 小文章对象
 */
export async function updateOne(id, a) {
  const result = await db('Article').where('id', id)
  .update({
    route: a.route,
    short_name: a.shortName,
    title: a.title,
    content: a.content,
    utl: a.url,
    update_at: new Date().getTime(),
    bg_url: a.bgUrl,
    bg_color: a.bgColor
  });

  return result[0];
}

/**
 * 添加文章历史记录
 * @param {number} id 小文章id
 */
export async function addViewHistory(id) {
  await db('View_History').insert({
    article_id: id,
    create_at: new Date()
  });
}

/**
 * 锁定或解除锁定
 * @param {number} id 小文章id
 * @param {boolean} lock 是否锁定
 */
export async function lockOne(id, lock) {
  return await db('Article').update('lock', lock ? 1 : 0).where('id', id);
}

/**
 * 通过id删除一条
 * @param {number} id 小博客id
 */
export async function deleteById(id) {
  return await db('Article').where('id', id).del();
}