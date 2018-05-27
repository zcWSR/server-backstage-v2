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

  router.get('/articles', CatchAsyncError(async (req, res) => {
    const rows = await ArticleService.queryAll();
    ReturnJson.ok(res, rows);
  }));

  router.post('/article/lock', CatchAsyncError(async (req, res) => {
    const id = req.body.id;
    const lock = eval(req.body.lock);
    const rows = await ArticleService.lockOne(id, lock);
    ReturnJson.ok(res, '');
  }));

  router.post('article/delete', CatchAsyncError(async (req, res) => {
    const id = req.body.id;
    await ArticleService.deleteById(id);
    ReturnJson.ok(res, '');
  }))

  router.post('/article/update', CatchAsyncError(async (req, res) => {
    const id = req.body.id;
    const article = req.body.article;
    await ArticleService.updateOne(id, article);
    ReturnJson.ok(res, '');
  }));

  router.get('/article/report/:id', CatchAsyncError(async (req, res) => {
    const id  = req.params.id;
    await ArticleService.addViewHistory();
    ReturnJson.ok(res, '');
  }));
}
