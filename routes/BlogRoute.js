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

async function getPosts(page) {
  let posts = await PostService.querySome(page);
  let count = await PostService.countAll();
  return {
    count: count,
    result: posts
  }
}

module.exports = blogRouter;