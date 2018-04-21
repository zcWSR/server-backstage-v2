import { Router } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import fs from 'fs';
const multer = require('multer');

import { uploadOne } from '../../service/imageService';
import JsonReturn from '../../utils/return-json';

const uploadFileMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024 * 1.5
  }
})

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.post('/img/upload', uploadFileMiddleware.single('img'),
  CatchAsyncError(async (req, res) => {
    console.log(req.file);
    console.log(req.body);
    if (!req.file) {
      JsonReturn.error(res, 'no file uploaded', -2);
      return ;
    }
    const imgBuffer = req.file.buffer;
    const imgName = req.body.imgName || req.file.originalname;
    if (!imgName || !imgBuffer) {
      JsonReturn.error(res, 'no file uploaded', -2);
      return ;
    }
    const fileInfo = await uploadOne(imgName, imgBuffer);
    JsonReturn.ok(res, fileInfo);
  }));
}