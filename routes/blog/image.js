import { Router } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import fs from 'fs';
const multer = require('multer');

import { insertOne, uploadOneFromUrl, querySome, deleteOne, deleteSome, countAll } from '../../service/imageService';
import JsonReturn from '../../utils/return-json';

const uploadFileMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 2
  }
});

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.post('/img/upload', uploadFileMiddleware.single('img'),
  CatchAsyncError(async (req, res) => {
    if(req.file) {
      const imgBuffer = req.file.buffer;
      const imgName = req.body.imgName || req.file.originalname;
      if (!imgName || !imgBuffer) {
        JsonReturn.error(res, 'no file uploaded', -2);
        return ;
      }
      const fileInfo = await insertOne(imgName, imgBuffer);
      JsonReturn.ok(res, fileInfo);
      return ;
    } else {
      const imgUrl = req.body.imgUrl;
      const imgName = req.body.imgName;
      if (!imgUrl || !imgName) {
        JsonReturn.error(res, 'no file url found', -2);
        return ;
      }
      const fileInfo = await uploadOneFromUrl(imgName, imgUrl);
      JsonReturn.ok(res, fileInfo);
    }
  }));

  router.get('/imgs', CatchAsyncError(async (req, res) => {
    const curPage = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 20;
    const list = await querySome(curPage, pageSize);
    const totalCount = await countAll();
    JsonReturn.ok(res, {
      pageSize,
      list,
      totalCount,
      curPage
    });
  }));

  router.post('/img/delete', CatchAsyncError(async (req, res) => {
    const id = req.body.id;
    const result = await deleteOne(id);
    JsonReturn.ok(res, result);
  }));

  router.post('/img/delete/some', CatchAsyncError(async (req, res) => {
    let ids = req.body.ids;
    ids = ids.split(',').map(id => id.trim());
    const result = await deleteSome(ids);
    JsonReturn.ok(res, result);
  }));

  
}