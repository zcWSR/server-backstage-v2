const express = require('express');
const routes = require('./routes');

require('./db');

const app = express();

app.use('/', routes.main);

module.exports = app;