const Log = require('log');

import { db } from '../db';

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
      a.lock as lock
      i.id as img_id,
      i.name as img_name,
      i.url as img_url,
      i.main_color as img_color
      a.bg_main_color as bg_main_color
      from Article a
        left join Image i on i.id = a.image_id
  `);
    if (rows.length) {
      const article = rows[0];
      return {
        id: article.id,
        route: article.route,
        shortName: article.shortName,
        title: article.title,
        content: article.content,
        lock: !!article.lock,
        url: article.url,
        category: article.category,
        labels: article.labels,
        bg: {
          id: article.img_id,
          name: article.img_name,
          url: article.img_url,
          mainColor: article.img_color
        }
      };
    }
    return null;
}

/**
 * 
 * @param {{ title: string, createAt: string, updateAt: string, category: string, labels: string[], section: string, rest: string, imageId }} post 文章对象
 */
export async function insertOne(article) {
  
}