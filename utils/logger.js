import * as log4js from 'log4js';
const logger = log4js.getLogger();
logger.level = process.env.ENV === 'dev' ? 'debug' : 'info'
export default logger;