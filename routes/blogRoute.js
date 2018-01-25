const { Router } = require('express');
const fs = require('fs');
const path = require('path');
const PostService = require('../service/postService');

const blogRouter = Router();

blogRouter.get('/', (req, res) => {
  res.send('hello, blog!');
})

blogRouter.get('/posts', (req, res) => {
  let page = req.query.page || 1;
  getPosts(page).then((data) => res.jsonp(data));
});

blogRouter.get('/posts/:id', (req, res) => {
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
  let count = await PostService.countAllPost();
  return {
    count: count,
    result: posts
  }
}

blogRouter.get('/categories', (req, res) => {
  PostService.queryAllCates()
    .then(data => res.jsonp({ result: data }));
});

blogRouter.get('/labels', (req, res) => {
  PostService.queryAllLabels()
    .then(data => res.jsonp({ result: data }));
});

blogRouter.get('/about', (req, res) => {
  fs.readFile(path.resolve(__dirname, '../src/about.md'), (err, data) => {
    if (err)
        res.status(500).jsonp({ error: err });
    else
        res.jsonp({ result: data.toString() });
  });
});

blogRouter.get('/resume', (req, res) => {
  fs.readFile(path.resolve(__dirname, '../src/resume.md'), (err, data) => {
    if (err)
        res.status(500).jsonp({ error: err });
    else
        res.jsonp({ result: data.toString() });
  });
});

blogRouter.get('/imgs', (req, res) => {
  fs.readdir(path.resolve(__dirname, '../src/img'), (err, files) => {
      if (err)
          res.status(500).jsonp({ error: err });
      else
          res.jsonp({ result: files.filter(file => file !== '.DS_Store') });
  });
});

blogRouter.get('/imgs/:name', (req, res) => {
  fs.readFile(path.resolve(__dirname, `../src/img/${req.params.name}`), (err, data) => {
      if (err)
          res.status(500).jsonp({ error: err });
      else {
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(data, 'binary');
      }
  });
});

module.exports = blogRouter;
