import { Router } from 'express';
import * as PostService from '../../service/postService'
import ReturnJson from '../../utils/return-json';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  
  router.get('/categories', (req, res) => {
    PostService.queryAllCates()
      .then(data => ReturnJson.ok(res, data))
      .catch(error => ReturnJson.error(res, error));
  });
  
  router.get('/categories/with-count', (req, res) => {
    PostService.queryAllCatesWithCount()
    .then(data => ReturnJson.ok(res, data))
    .catch(error => ReturnJson.error(res, error));
  });
}