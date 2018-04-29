import { Router } from 'express';
const Log = require('log');

import * as PostService from '../../service/postService';
import ReturnJson from '../../utils/return-json';
import CatchAsyncError from '../../utils/catchAsyncError';
import * as ArticleService from '../../service/articleService';


const logger = new Log('route: /blog/posts');
/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/article/:id', CatchAsyncError(async (req, res) => {
    const id = req.params.id;
    const data = await ArticleService.queryOneById(id)
  }));

  router.post('/article/update/:id', CatchAsyncError(async (req, res) => {
    const id = req.params.id;
    const data = await ArticleService
  }));

  router.get('/article/report/:id', CatchAsyncError(async (req, res) => {
    const id  = req.params.id;
    await ArticleService.addViewHistory()
    ReturnJson(res, '');
  }));
}
