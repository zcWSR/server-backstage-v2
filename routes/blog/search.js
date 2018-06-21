import { Router } from 'express';
import logger from '../../utils/logger';

import * as PostService from '../../service/postService';
import CatchAsyncError from '../../utils/catchAsyncError';
import ReturnJson from '../../utils/return-json';



/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/search/title/:content', CatchAsyncError(async (req, res) => {
    const content = req.params.content;
    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 5;
    const data = await PostService.queryByTitle(content, page, pageSize)
    ReturnJson.ok(res, data);
  }));

  router.get('/search/label/:content', CatchAsyncError(async (req, res) => {
    const content = req.params.content;
    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 5;
    const data = await PostService.queryByLabel(content, page, pageSize);
    ReturnJson.ok(res, data);
  }));

  router.get('/search/category/:content', CatchAsyncError(async (req, res) => {
    const content = req.params.content;
    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 5;
    const data = await PostService.queryByCate(content, page, pageSize);
    ReturnJson.ok(res, data);
  }));
}