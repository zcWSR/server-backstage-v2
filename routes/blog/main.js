import { Router } from 'express';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/', (req, res) => {
    res.send('hello, blog!');
  })
}