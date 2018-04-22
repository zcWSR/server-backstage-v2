const Log = require('log');

import { db } from '../db';
import * as qiniu from 'qiniu';
import { ACCESS_KEY, SECRET_KEY } from './qiniu.config';

const logger = new Log('imageService');

const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
const putPolicy = new qiniu.rs.PutPolicy({
  scope: 'blog',
  expires: 60 * 60 * 24 * 365 * 10
});
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z1;

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

const buckgetManager = new qiniu.rs.BucketManager(mac, config);

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

export function getImageList(pageSize, pageMarker = '') {
  return new Promise((resolve, reject) => {
    buckgetManager.listPrefix(
      'blog',
      { limit: pageSize, prefix: '', marker: pageMarker },
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

export function deleteOne(name) {
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
