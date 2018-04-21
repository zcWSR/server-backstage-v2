const Log = require('log');

import { db } from '../db';
import * as qiniu from 'qiniu';
import { ACCESS_KEY, SECRET_KEY } from './qiniu.config';


const logger = new Log('imageService');

const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);
const putPolicy = new qiniu.rs.PutPolicy({
  scope: 'blog',
  expires: 60*60*24*365*10
});
const uploadToken = putPolicy.uploadToken(mac);

const config = new qiniu.conf.Config();
config.zone = qiniu.zone.Zone_z1;

const formUploader = new qiniu.form_up.FormUploader(config);
const putExtra = new qiniu.form_up.PutExtra();

function uploadFile(fileName, fileBuffer) {
  return new Promise((resolve, reject) => {
    formUploader.put(uploadToken, fileName, fileBuffer, putExtra,
      (err, resBody, resInfo) => {
        if (err) reject(err);
        if (resInfo.statusCode == 200) {
          resolve(resBody);
        } else {
          reject({
            code: resInfo.statusCode,
            errmsg: resBody.errmsg.error
          });
        }
      });
  });
}

/**
 * 
 * @param {string} fileName 文件名
 * @param {Buffer} fileBuffer 文件buffer
 */
export async function uploadOne(fileName, fileBuffer) {
  const fileInfo = uploadFile(fileName, fileBuffer);
  return fileInfo;
}
