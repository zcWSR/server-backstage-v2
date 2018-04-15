const Log = require('log');

import { db } from '../db';

const logger = new Log('imageService');

/**
 * 
 * @param {{ name?: string, url: string, color: string }} image 
 */
export async function insertOne(image) {
  const imageId = await db('Image').insert({
    name: image.name || image.url,
    url: image.url,
    color: image.color
  });
  return parseInt(imageId);
}

/**
 * 通过Id查找图片
 * @param {*} id 
 */
export async function queryOne(id) {
  const image = await db('Image').first().where('id', id);
  return image;
}