import { Router } from 'express';
const Log = require('log');

import * as PostService from '../../service/postService';
import ReturnJson from '../../utils/return-json';
import * as ArticleService from '../../service/articleService';


const logger = new Log('route: /blog/posts');
/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/article/:id', (req, res) => {
    const id = req.params.id;
    ArticleService.queryOneById(id)
      .then(data => {
        if (data) {
        }
      })
  })
}