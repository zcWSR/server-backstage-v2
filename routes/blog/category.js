import { Router } from 'express';
import * as PostService from '../../service/postService'
import { catchError } from '../../utils/decorator/express'
import ReturnJson from '../../utils/return-json';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  
  function a (req, res) {
    PostService.queryAllCates()
      .then(data => ReturnJson.ok(res, data))
      .catch(error => ReturnJson.error(res, error));
  }

  router.get('/categories', a);
  
  router.get('/categories/with-count', (req, res) => {
    PostService.queryAllCatesWithCount()
    .then(data => ReturnJson.ok(res, data))
    .catch(error => ReturnJson.error(res, error));
  });
}