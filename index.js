const express = require('express');
const app = express();

app.use('/', require('./routes/mainRoute'));
app.use('/blog', require('./routes/blogRoute'));
app.use('/konachan', require('./routes/konaChanRoute'));

module.exports = app;