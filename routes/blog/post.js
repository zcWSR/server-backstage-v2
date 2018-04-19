import { Router } from 'express';
const Log = require('log');

import * as PostService from '../../service/postService';
import ReturnJson from '../../utils/return-json';


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

  router.get('/posts', (req, res) => {
    const page = req.query.page || 1;
    const pageSize = req.query.pageSize || 5;
    getPosts(page, pageSize).then(data => ReturnJson.ok(res, data));
  });
  
  router.post('/posts/upload', (req, res) => {
    const post = req.body;
    PostService.insertOne(post)
      .then(() => ReturnJson.ok(res, null))
      .catch(error => ReturnJson.error(res, error));
  });
  
  router.get('/posts/by-title/:title', (req, res) => {
    logger.info('/posts/by-title/%s', req.params.title);
    PostService.queryByTitle(req.params.title)
      .then(data => ReturnJson.ok(res, data))
      .catch(error => ReturnJson.error(res, error));
  });
  
  router.get('/posts/:id', (req, res) => {
    let id = req.params.id;
    if (!id)
      ReturnJson.error(res, `not found post with id: ${id}`);
    else
      PostService.queryOneById(id)
        .then(data => ReturnJson.ok(res, data))
        .catch(error => ReturnJson.error(res, error));
  });

  router.delete('/posts/delete/:id', (req, res) => {
    let id = req.params.id;
    if (!id)
      ReturnJsonerror(res, `not found post with id: ${id}`);
    else 
      PostService
  })
}