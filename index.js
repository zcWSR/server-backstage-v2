import express from 'express';
import bodyParser from 'body-parser'
const Log = require('log');

import { setRoutes } from './utils/route';
import { createAllTables } from './db';
import JsonReturn from './utils/return-json';

const logger = new Log('app');
const app = express();

app.use(bodyParser.json());
setRoutes(app);
app.use((err, req, res, next) => {
  const errmsg = err.message || err.errmsg || err;
  const code = err.code || 0;
  logger.error(errmsg);
  if (err.stack) {
    logger.error(err.stack)
  }
  JsonReturn.error(res, errmsg, code);
});

const args = process.argv;
let port = 2333;

if (args.length > 2 && (args[2] === '-p' || args[2] === '--port')) {
    port = args[3];
} else {
  logger.alert(`did not find port settings, use default port ${port}`);
}
let server = app.listen(port);
logger.info(`server in ${process.env.ENV || 'prod'} mode`);
logger.alert(`ご注意ください`);

server.on('error', (err) => {
  logger.error(err.message);
  // if (err.syscall !== 'listen') {
  //   if (err.syscall === 'read') {
  //     console.error(error.message);
  //   }
  //   throw error;
  // }

  // switch (error.code) {
  //   case 'EACCES': 
  //     console.error(`${bind} requires elevated privileges`);
  //     process.exit(1);
  //     break;
  //   case 'EADDRINUSE': 
  //     console.error(`${bind} is already in use`);
  //     process.exit(1);
  //     break;
  //   default: 
  //     throw error;
  // }
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaugh Exception: \n${err.message}`);
});


createAllTables();