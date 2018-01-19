const { Router } = require('express');

const KCService = require('../service/konaChanService');

const konaChanRoutes = Router();

konaChanRoutes.get('/', (req, res) => {
  res.send('hello, konaChan!');
});

konaChanRoutes.get('/tag', (req, res) => {
  KCService.getTagList(req.query)
    .then(tags => res.jsonp(tags))
    .catch(err => res.jsonp({ code: 500, error: err }));
});

konaChanRoutes.get('/post', (req, res) => {
  KCService.getImageList(req.query)
    .then(imgs => res.jsonp(imgs))
    .catch(err => res.jsonp({ code: 500, error: err }));
});

module.exports = konaChanRoutes;

