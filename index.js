const express = require('express');
const routes = require('./routes');

const app = express();

app.use('/', routes.main);
app.use('/blog', routes.blog);

module.exports = app;