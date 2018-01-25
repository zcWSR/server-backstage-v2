require('babel-core/register');

require('./db').createBlogTables()
.then(() => {
  const app = require('./index');
  let args = process.argv;
  let port = 2333;
  
  if (args.length > 2 && (args[2] === '-p' || args[2] === '--port')) {
      port = args[3];
  } else {
    console.warn(`did not find port settings, use default port ${port}`);
  }
  let server = app.listen(port);
  console.warn(`server in ${process.env.ENV || 'production'} mode`);
  console.warn(`ご注意ください`);
  
  server.on('error', (err) => {
    if (err.syscall !== 'listen') {
      if (err.syscall === 'read') {
        console.error(error.message);
      }
      throw error;
    }
  
    switch (error.code) {
      case 'EACCES': 
        console.error(`${bind} requires elevated privileges`);
        process.exit(1);
        break;
      case 'EADDRINUSE': 
        console.error(`${bind} is already in use`);
        process.exit(1);
        break;
      default: 
        throw error;
    }
  });
  
  process.on('uncaughtException', (err) => {
    console.error(`Uncaugh Exception: \n${err.message}`);
  })
}).catch(err => {
  console.log(err);
});




