import { Router } from 'express';
import * as PostService from '../../service/postService';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/labels', (req, res) => {
    PostService.queryAllLabels()
      .then(data => res.jsonp({ result: data }));
  });
  
  router.get('/labels/with-count', (req, res) => {
    PostService.queryAllLabelsWithCount()
      .then(data => res.jsonp({ result: data }));
  });
}