import { Router } from 'express';
const Log = require('log');

import * as PostService from '../../service/postService';
import ReturnJson from '../../utils/return-json';
import CatchAsyncError from '../../utils/catchAsyncError';


const logger = new Log('route: /blog/posts');
/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  async function getPosts(page, pageSize) {
    let posts = await PostService.querySome(page, pageSize);
    let totalCount = await PostService.countAllPost();
    return {
      totalCount,
      list: posts,
      curPage: +page,
      pageSize
    };
  }

  router.get('/posts', CatchAsyncError(async (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 5;
    const postList = await getPosts(page, pageSize);
    ReturnJson.ok(res, postList);
  }));
  
  router.post('/posts/upload', CatchAsyncError(async (req, res) => {
    const post = req.body.post;
    await PostService.insertOne(post)
    ReturnJson.ok(res, null);
  }));
  
  router.get('/posts/by-title/:title', CatchAsyncError(async (req, res) => {
    logger.info('/posts/by-title/%s', req.params.title);
    const data = await PostService.queryByTitle(req.params.title);
    ReturnJson.ok(res, data);
  }));
  
  router.get('/posts/:id', CatchAsyncError(async (req, res) => {
    let id = req.params.id;
    if (!id)
      ReturnJson.error(res, `not found post with id: ${id}`);
    else {
      const data = await PostService.queryOneById(id)
      ReturnJson.ok(res, data);
    }
  }));

  router.delete('/posts/delete/:id', CatchAsyncError(async (req, res) => {
    let id = req.params.id;
    if (!id)
      ReturnJson.error(res, `not found post with id: ${id}`);
    else 
      await PostService
  }));
}