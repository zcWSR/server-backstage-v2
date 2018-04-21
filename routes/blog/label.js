import { Router } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import * as PostService from '../../service/postService';
import ReturnJson from '../../utils/return-json';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/labels', CatchAsyncError(async (req, res) => {
    const data = await PostService.queryAllLabels();
    ReturnJson.ok(res, data);
  }));
  
  router.get('/labels/with-count', CatchAsyncError(async (req, res) => {
    const data = await PostService.queryAllLabelsWithCount();
    ReturnJson.ok(res, data);
  }));
}