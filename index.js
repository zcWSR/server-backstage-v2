import express from 'express';
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser';
import session from 'express-session';
import logger from './utils/logger';

import { setRoutes } from './utils/route';
import { createAllTables } from './db';
import JsonReturn from './utils/return-json';

createAllTables().then(() => {
  initServer();
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaugh Exception: \n${err.message}`);
});

function initServer() {
  const app = express();
  const env = process.env.ENV;
  
  const COOKIE_SECRET = 'zcwsr';
  app.use(bodyParser.json());
  app.use(cookieParser(COOKIE_SECRET));
  app.use(session({
    resave: true, // 即使 session 没有被修改，也保存 session 值，默认为 true
    saveUninitialized: true,
    secret: COOKIE_SECRET,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 10 },
    rolling: true
  }));
  if (env === 'dev') {
    setRoutes(app);
  } else {
    setRoutes(app, 'api');
  }
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
    logger.warn(`did not find port settings, use default port ${port}`);
  }
  let server = app.listen(port);
  logger.warn(`server in ${env || 'prod'} mode`);
  logger.warn(`all routes mounted under '/${env === 'dev' || env === 'develop' ? '' : 'api'}'`);
  logger.warn(`ご注意ください`);
  
  server.on('error', (error) => {
    // if (err.syscall !== 'listen') {
    //   if (err.syscall === 'read') {
    //     console.error(error.message);
    //   }
    //   throw error;
    // }
  
    switch (error.code) {
      case 'EACCES': 
        logger.error(`port ${port} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE': 
        logger.error(`port ${port} is already in use`);
        process.exit(1);
        break;
      // default: 
      //   logger.error(error.message);
    }
  });
}
