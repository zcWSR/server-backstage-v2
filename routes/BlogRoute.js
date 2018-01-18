const { Router } = require('express');
const PostService = require('../service/postService')

const blogRouter = Router();

blogRouter.get('/', (req, res) => {
  res.send('hello, blog!');
})

blogRouter.get('/posts', (req, res) => {
  let page = req.query.page || 1;
  getPosts(page).then((data) => res.jsonp(data));
});

blogRouter.get('/post/:id', (req, res) => {
  let id = req.params.id;
  if (!id)
    res.status(404).jsonp({ error: `not found post with _id: ${id}` });
  else
    PostService.queryOneById(id)
        .then(post => res.jsonp({ result: post }))
        .catch(error => res.status(500).jsonp({ error: error }));
})

async function getPosts(page) {
  let posts = await PostService.querySome(page);
  let count = await PostService.countAll();
  return {
    count: count,
    result: posts
  }
}

module.exports = blogRouter;