import os from 'os';
import { Router } from 'express';
import * as ps from 'current-processes';
import ReturnJson from '../../utils/return-json';
import CatchAsyncError from '../../utils/catchAsyncError';

const Log = require('log');

/**
 * 
 * @param {Router} router
 */
export default function (router) {
  router.get('/server-status', (req, res) => {
    ps.get((err, pses) => {
      if (err) ReturnJson.error(res, err);
      const currentPs = pses.find(ps => ps.pid === process.pid);
      ReturnJson.ok(res, currentPs);
    })
  });

  router.get('/login', CatchAsyncError(async (req, res) => {
    
  }));
}