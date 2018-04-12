import { Router } from 'express';
import * as PostService from '../../service/postService';
import ReturnJson from '../../utils/return-json';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/labels', (req, res) => {
    PostService.queryAllLabels()
    .then(data => ReturnJson.ok(res, data))
    .catch(error => ReturnJson.error(res, error));
  });
  
  router.get('/labels/with-count', (req, res) => {
    PostService.queryAllLabelsWithCount()
    .then(data => ReturnJson.ok(res, data))
    .catch(error => ReturnJson.error(res, error));
  });
}