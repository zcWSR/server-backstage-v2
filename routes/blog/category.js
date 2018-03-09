import { Router } from 'express';
import * as PostService from '../../service/postService'
import { catchError } from '../../utils/decorator/express'

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  
  function a (req, res) {
    PostService.queryAllCates()
      .then(data => res.jsonp({ result: data }));
  }

  router.get('/categories', a);
  
  router.get('/categories/with-count', (req, res) => {
    PostService.queryAllCatesWithCount()
      .then(data => res.jsonp({ result: data }));
  });
}