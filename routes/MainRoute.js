const { Router } = require('express');

const mainRouter = Router();

mainRouter.get('/', (req, res) => {
    res.send('hello, mySite !');
})

module.exports = mainRouter;