const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mainRoute = require('./routes/mainRoute');
const blogRoute = require('./routes/blogRoute');
const konachanRoute = require('./routes/konaChanRoute');

app.use(bodyParser.json());
app.use('/', mainRoute);
app.use('/blog', blogRoute);
app.use('/konachan', konachanRoute);

module.exports = app;