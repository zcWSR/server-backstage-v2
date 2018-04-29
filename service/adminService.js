const Log = require('log');

import { db } from '../db';
import moment from 'moment';

const logger = new Log('AdminService');

export async function getConfig() {
  const meta = await db('Blog_Config').first();
  console.log(meta);
  return meta;
}