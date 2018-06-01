import os from 'os';
import { Router } from 'express';
import * as ps from 'current-processes';
import * as AdminService from '../../service/adminService';
import ReturnJson from '../../utils/return-json';
import CatchAsyncError from '../../utils/catchAsyncError';

const Log = require('log');

/**
 * 
 * @param {Router} router
 */
export default function (router) {
  //#region dashboard 相关
  router.get('/admin/server-status', (req, res) => {
    ps.get((err, pses) => {
      if (err) ReturnJson.error(res, err);
      const currentPs = pses.find(ps => ps.pid === process.pid);
      ReturnJson.ok(res, currentPs);
    })
  });

  router.get('/admin/motto', (req, res) => {
    const motto = AdminService.getMotto();
    ReturnJson.ok(res, motto);
  });

  router.get('/admin/report', CatchAsyncError(async (req, res) => {
    const all = await AdminService.getViewCount();
    const today = await AdminService.getTodayViewCount();
    ReturnJson.ok(res, { all, today });
  }));

  router.get('/admin/view-rank', CatchAsyncError(async (req, res) => {
    const rank = await AdminService.getViewRank();
    ReturnJson.ok(res, rank);
  }))

  //#endregion

  router.get('/admin/config', CatchAsyncError(async (req, res) => {
    const data = await AdminService.getConfig();
    ReturnJson.ok(res, data);
  }));

  router.post('/admin/config/update', CatchAsyncError(async (req, res) => {
    const config = req.body.config;
    await AdminService.updateConfig(config);
    ReturnJson.ok(res, '');
  }));


  router.get('/admin/login', CatchAsyncError(async (req, res) => {
    ReturnJson.ok(res, data);
  }));

}

