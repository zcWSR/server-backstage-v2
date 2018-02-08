import { Router } from 'express';

import * as KCService from '../../service/konaChanService';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/', (req, res) => {
    res.send('hello, konaChan!');
  });
  
  router.get('/tag', (req, res) => {
    KCService.getTagList(req.query)
      .then(tags => res.jsonp(tags))
      .catch(error => res.jsonp({ code: 500, error }));
  });
  
  router.get('/post', (req, res) => {
    KCService.getImageList(req.query)
      .then(imgs => res.jsonp(imgs))
      .catch(error => res.jsonp({ code: 500, error }));
  });
}