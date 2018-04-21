import { Router } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import * as PostService from '../../service/postService'
import ReturnJson from '../../utils/return-json';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  
  router.get('/categories', CatchAsyncError(async (req, res) => {
    const data = await PostService.queryAllCates();
    ReturnJson.ok(res, data);
  }));
  
  router.get('/categories/with-count', CatchAsyncError(async (req, res) => {
    const data = await PostService.queryAllCatesWithCount();
    ReturnJson.ok(res, data);
  }));
}