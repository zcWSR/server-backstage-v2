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

  router.get('/posts/:id', CatchAsyncError(async (req, res) => {
    let id = req.params.id;
    if (!id)
      ReturnJson.error(res, `not found post with id: ${id}`);
    else {
      const data = await PostService.queryOneById(id)
      ReturnJson.ok(res, data);
    }
  }));

  router.post('/posts/delete/:id', CatchAsyncError(async (req, res) => {
    let id = req.params.id;
    if (!id)
      ReturnJson.error(res, `not found post with id: ${id}`);
    else 
      await PostService
  }));

  router.get('/posts/report/:id', CatchAsyncError(async (req, res) => {
    const postId = req.params.id;
    await PostService.addViewHistory(postId);
    ReturnJson.ok(res, '');
  }));
  
}