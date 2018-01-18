const { Router } = require('express');

const mainRouter = Router();

mainRouter.get('/', (req, res) => {
    res.send('hello, main!');
})

module.exports = mainRouter;