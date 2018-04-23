const Log = require('log');

import { db } from '../db';
import moment from 'moment';

const logger = new Log('ArticleService');

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
      from Article a;
  `);
    if (rows.length) {
      const article = rows[0];
      return article;
    }
    return null;
}

/**
 * 
 * @param {{ title: string, createAt: string, updateAt: string, category: string, labels: string[], section: string, rest: string, imageId }} post 文章对象
 */
export async function insertOne(article) {
  const ids = await db('Article').insert({
    route: article.route,
    short_name: article.shortName,
    title: article.title,
    content: article.content,
    url: article.url,
    create_at: new Date(),
    update_at: new Date(),
    lock: article.lock,
    bg_url: article.bgUrl,
    bg_color: article.bgColor
  });
  logger.info(`新建文章完成, id: ${ids[0]}`);
}

export async function updateOne(id, a) {
  const result = await db('Article').where('id', id)
  .update({
    route: a.route,
    short_name: a.shortName,
    title: a.title,
    content: a.content,
    utl: a.url,
    update_at: new Date(),
    bg_url: a.bgUrl,
    bg_color: a.bgColor
  });

  return result[0];
}