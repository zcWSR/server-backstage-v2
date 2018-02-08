import { Router } from 'express';
import * as PostService from '../../service/postService'

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/categories', (req, res) => {
    PostService.queryAllCates()
      .then(data => res.jsonp({ result: data }));
  });
  
  router.get('/categories/with-count', (req, res) => {
    PostService.queryAllCatesWithCount()
      .then(data => res.jsonp({ result: data }));
  });
}