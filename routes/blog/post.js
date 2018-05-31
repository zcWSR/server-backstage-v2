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
    await PostService.uploadOne(post)
    ReturnJson.ok(res, null);
  }));

  router.post('/post/update', CatchAsyncError(async (req, res) => {
    const id = req.body.id;
    const post = req.body.post;
    await PostService.updateOne(post, id);
    ReturnJson.ok(res, '');
  }));

  router.get('/posts/search', CatchAsyncError(async (req, res) => {
    const curPage = +req.query.curPage || 1;
    const pageSize = +req.query.pageSize || 10;
    const content = req.query.content;
    const withLock = eval(req.query.withLock);
    const list = await PostService.querySomeByTitle(curPage, pageSize, content, withLock);
    const totalCount = await PostService.countWithTitle(content);
    ReturnJson.ok(res, {
      pageSize,
      list,
      totalCount,
      curPage,
      withLock
    });
  }));

  router.get('/posts/report/:id', CatchAsyncError(async (req, res) => {
    const postId = req.params.id;
    await PostService.addViewHistory(postId);
    ReturnJson.ok(res, '');
  }));

  router.get('/posts/:id', CatchAsyncError(async (req, res) => {
    let id = req.params.id;
    if (!id)
      ReturnJson.error(res, `not found post with id: ${id}`);
    else {
      const data = await PostService.queryOneById(id);
      if (data.id) {
        ReturnJson.ok(res, data);
      } else {
        ReturnJson.error(res, 'post not exist');
      }
    }
  }));

  router.post('/posts/lock', CatchAsyncError(async (req, res) => {
    const lock = req.body.lock;
    const id = req.body.id;
    await PostService.lockOrUnLock(id, lock);
    ReturnJson.ok(res, '');
  }));

  router.post('/posts/delete', CatchAsyncError(async (req, res) => {
    const id = req.body.id;
    await PostService.deletePostById(id);
    ReturnJson.ok(res, '');
  }));
  
}