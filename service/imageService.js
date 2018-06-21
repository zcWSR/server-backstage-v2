import logger from '../utils/logger';
import * as qiniu from 'qiniu';

import { db } from '../db';
import { ACCESS_KEY, SECRET_KEY, IMAGE_HOST } from './qiniu.config';
import toSmallCamel from '../utils/toSmallCamel';


const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
const putPolicy = new qiniu.rs.PutPolicy({
  scope: 'blog',
  expires: 60 * 60 * 24 * 365 * 10,
  returnBody: `{
    "name": "$(key)",
    "mainColor": $(imageAve),
    "size": $(fsize),
    "width": $(imageInfo.width),
    "height": $(imageInfo.height)
  }`
});
// 上传用token凭证
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z1;

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

const buckgetManager = new qiniu.rs.BucketManager(mac, config);

/**
 * 添加一张图片
 * @param {string} fileName 文件名
 * @param {Buffer} fileBuffer 图片Buffer
 */
export async function insertOne(fileName, fileBuffer) {
  const { name, mainColor: { RGB }, size, width, height } = await uploadOne(fileName, fileBuffer);
  const forInsert = {
    name,
    main_color: `${RGB}`.replace('0x', '#'),
    size,
    width,
    height,
    create_at: new Date().getTime()
  };
  await db('image').insert(forInsert);
  return toSmallCamel(forInsert, '_');
}

/**
 * 
 * @param {string} fileName 文件名
 * @param {string} fileUrl 文件url
 */
export async function insertOneFromUrl(fileName, fileUrl) {

}

/**
 * 上传文章
 * @param {string} fileName 文件名
 * @param {Buffer} fileBuffer 图片Buffer
 */
export function uploadOne(fileName, fileBuffer) {
  return new Promise((resolve, reject) => {
    formUploader.put(
      uploadToken,
      fileName,
      fileBuffer,
      putExtra,
      (err, resBody, resInfo) => {
        if (err) reject(err);
        if (resInfo.statusCode == 200) {
          resolve(resBody);
        } else {
          reject({
            code: resInfo.statusCode,
            errmsg: resBody.error
          });
        }
      }
    );
  });
}

/**
 * 通过Url上传图片
 * @param {string} fileName 文件名
 * @param {string} fileUrl 文件Url
 */
export function uploadOneFromUrl(fileName, fileUrl) {
  return new Promise((resolve, reject) => {
    buckgetManager.fetch(fileUrl, 'blog', fileName, (err, resBody, resInfo) => {
      if (err) reject(err);
      if (resInfo.statusCode == 200) {
        resolve(resBody);
      } else {
        reject({
          code: resInfo.statusCode,
          errmsg: resBody.error
        });
      }
    });
  });
}

// /**
//  * 获取文章列表
//  * @param {number} pageSize 一页显示多少个
//  * @param {*} pageMarker 页尾锚记
//  */
// export function getImageList(pageSize, pageMarker = '') {
//   return new Promise((resolve, reject) => {
//     buckgetManager.listPrefix(
//       'blog',
//       { limit: pageSize, prefix: '', marker: pageMarker },
//       (err, resBody, resInfo) => {
//         if (err) reject(err);
//         if (resInfo.statusCode == 200) {
//           resolve(resBody);
//         } else {
//           reject({
//             code: resInfo.statusCode,
//             errmsg: resBody.error
//           });
//         }
//       }
//     );
//   });
// }

export async function deleteOne(id) {
  const forDelete = await db('image').where('id', id).first();
  if (!forDelete) {
    throw new Error('image not found');
  }
  try {
    await removeOne(forDelete.name);
  } catch(err) {
    logger.error(err.errmsg || err.message || e);
  } finally {
    return await forceDelete(id);
  }
}

export async function forceDelete(id) {
  return await db('image').where('id', id).del();
}

export async function deleteSome(ids) {
  const rows = await db('Image').whereIn('id', ids);
  if (!rows.length) {
    throw new Error('image not found');
  }
  const names = rows.map(item => item.name);
  try {
    await removeSome(names);
  } catch(err) {
    logger.error(err.errmsg || err.message || e);
  } finally {
    return await forceDeleteSome(ids);
  }
}

export async function forceDeleteSome(ids) {
  return await db('Image').whereIn('id', ids).del();
}

/**
 * 删除云端上的一张图片
 * @param {string} name 文件名
 */
export function removeOne(name) {
  return new Promise((resolve, reject) => {
    buckgetManager.delete('blog', name, (err, resBody, resInfo) => {
      if (err) reject(err);
      if (resInfo.statusCode == 200) {
        resolve(resBody);
      } else {
        reject({
          code: resInfo.statusCode,
          errmsg: resBody.error
        });
      }
    });
  });
}

/**
 * 删除云端上的一些图片
 * @param {string} names 文件名
 */
export function removeSome(names) {
  return new Promise((resolve, reject) => {
    const deleteOperations = names.map(name => qiniu.rs.deleteOp('blog', name));
    buckgetManager.batch(deleteOperations, (err, resBody, resInfo) => {
      if (err) reject(err);
      if (resInfo.statusCode == 200) {
        resolve(resBody);
      } else {
        reject({
          code: resInfo.statusCode,
          errmsg: resBody.error
        });
      }
    });
  })
}

export async function querySome(page, pageSize) {
  const rows = await db('Image').select('*').limit(pageSize).offset((page - 1) * pageSize).orderBy('create_at', 'desc');
  const result = rows.map(item => {
    const parsed = toSmallCamel(item, '_');
    parsed.url = `${IMAGE_HOST}/${parsed.name}`;
    return parsed;
  });
  return result;
}

export async function countAll() {
  let data = await db('Image')
  .count('id as count')
  .first();
  return data.count;
}
