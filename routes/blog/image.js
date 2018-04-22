import { Router } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import fs from 'fs';
const multer = require('multer');

import { uploadOne, uploadOneFromUrl, getImageList, deleteOne } from '../../service/imageService';
import JsonReturn from '../../utils/return-json';

const uploadFileMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 2
  }
})

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
      const fileInfo = await uploadOne(imgName, imgBuffer);
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

  router.get('/img/list', CatchAsyncError(async (req, res) => {
    const pageSize = req.query.pageSize || 2;
    const marker = req.query.marker || '';
    const list = await getImageList(pageSize, marker);
    JsonReturn.ok(res, list);
  }));

  router.post('/img/delete/:name', CatchAsyncError(async (req, res) => {
    const name = req.params.name;
    const result = await deleteOne(name);
    JsonReturn.ok(res, result);
  }));

  
}