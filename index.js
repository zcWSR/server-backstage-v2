const express = require('express');
const routes = require('./routes');

const app = express();

app.use('/', routes.main);

module.exports = app;