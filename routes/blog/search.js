import { Router } from 'express';
const Log = require('log');

import * as PostService from '../../service/postService';
import ReturnJson from '../../utils/return-json';


const logger = new Log('route: /blog/search');

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/search/post/:content', (req, res) => {
    const content = req.params.content;
    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 5;
    PostService.queryByTitle(content, page, pageSize)
      .then(data => ReturnJson.ok(res, data))
      .catch(error => ReturnJson.error(res, error));
  });

  router.get('/search/label/:content', (req, res) => {
    const content = req.params.content;
    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 5;
    PostService.queryByLabel(content, page, pageSize)
      .then(data => ReturnJson.ok(res, data))
      .catch(error => ReturnJson.error(res, error));
  });

  router.get('/search/category/:content', (req, res) => {
    const content = req.params.content;
    const page = +req.query.page || 1;
    const pageSize = +req.query.pageSize || 5;
    PostService.queryByCate(content, page, pageSize)
      .then(data => ReturnJson.ok(res, data))
      .catch(error => ReturnJson.error(res, error));
  });
}