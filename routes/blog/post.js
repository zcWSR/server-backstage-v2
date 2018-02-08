import { Router } from 'express';
import * as PostService from '../../service/postService';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/posts', (req, res) => {
    let page = req.query.page || 1;
    getPosts(page).then((data) => res.jsonp(data));
  });
  
  router.post('/posts/upload', (req, res) => {
    const post = req.body;
    PostService.insertOne(post)
      .then(() => res.jsonp({ result: 'ok' }))
      .catch(error => res.status(500).jsonp({ error }));
  });
  
  router.get('/posts/by-title/:title', (req, res) => {
    console.log(req.params.title);
    PostService.queryByTitle(req.params.title)
      .then(data => res.jsonp({ result: data }))
      .catch(error => res.status(500).jsonp({ error }));
  })
  
  router.get('/posts/:id', (req, res) => {
    let id = req.params.id;
    if (!id)
      res.status(404).jsonp({ error: `not found post with _id: ${id}` });
    else
      PostService.queryOneById(id)
        .then(post => res.jsonp({ result: post }))
        .catch(error => res.status(500).jsonp({ error }));
  })
  
  async function getPosts(page) {
    let posts = await PostService.querySome(page);
    let count = await PostService.countAllPost();
    return {
      count: count,
      result: posts
    }
  }
}