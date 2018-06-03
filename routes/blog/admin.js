import os from 'os';
import { Router } from 'express';
import * as ps from 'current-processes';
import * as AdminService from '../../service/adminService';
import loginCheck from '../../middleware/loginCheckMiddleware';
import ReturnJson from '../../utils/return-json';
import CatchAsyncError from '../../utils/catchAsyncError';

const Log = require('log');

const logger = new Log('route: /blog/admin')

/**
 * 
 * @param {Router} router
 */
export default function (router) {
  //#region dashboard 相关
  router.get('/admin/server-status', loginCheck, (req, res) => {
    ps.get((err, pses) => {
      if (err) ReturnJson.error(res, err);
      const currentPs = pses.find(ps => ps.pid === process.pid);
      ReturnJson.ok(res, currentPs);
    })
  });

  router.get('/admin/motto', loginCheck, (req, res) => {
    const motto = AdminService.getMotto();
    ReturnJson.ok(res, motto);
  });

  router.get('/admin/report', loginCheck, CatchAsyncError(async (req, res) => {
    const all = await AdminService.getViewCount();
    const today = await AdminService.getTodayViewCount();
    ReturnJson.ok(res, { all, today });
  }));

  router.get('/admin/view-rank', loginCheck, CatchAsyncError(async (req, res) => {
    const rank = await AdminService.getViewRank();
    ReturnJson.ok(res, rank);
  }))

  //#endregion

  router.get('/admin/config', loginCheck, CatchAsyncError(async (req, res) => {
    const data = await AdminService.getConfig();
    ReturnJson.ok(res, data);
  }));

  router.post('/admin/config/update', loginCheck, CatchAsyncError(async (req, res) => {
    const config = req.body.config;
    await AdminService.updateConfig(config);
    ReturnJson.ok(res, '');
  }));


  router.post('/admin/login', CatchAsyncError(async (req, res) => {
    const { username, password } = req.body;
    const result = await AdminService.checkLogin(username || '', password || '');
    if (!result) {
      logger.info('login checked');
      const token = AdminService.genToken(username);
      logger.info('gen token');
      logger.info('writing token to session, cookie, dataBase...');
      req.session.token = token;
      res.cookie('token', token, { maxAge: 1000 * 60 * 60 * 24 * 10, signed: true });
      res.cookie('username', username, { maxAge: 1000 * 60 * 60 * 24 * 10 });
      await AdminService.updateToken(username, token);
      logger.info('token write done');
      ReturnJson.ok(res, '');
    } else {
      ReturnJson.ok(res, result);
    }
  }));

  router.post('/admin/logout', CatchAsyncError(async (req, res) => {
    const username = req.body.username;
    req.session.token = '';
    res.clearCookie('token');
    res.clearCookie('username');
    // await AdminService.clearToken(username);
    ReturnJson.ok(res, '');
  }));

  router.post('/admin/username/update', loginCheck, CatchAsyncError(async (req, res) => {
    const { oldUsername, newUsername, password } = req.body;
    const result = await AdminService.updateUsername(oldUsername, newUsername, password);
    if (result) {
      ReturnJson.ok(res, result);
    } else {
      req.session.token = '';
      res.clearCookie('token');
      res.clearCookie('username');
      ReturnJson.ok(res, '');
    }
  }));

  router.post('/admin/password/update', loginCheck, CatchAsyncError(async (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    const result = await AdminService.updatePassword(username, oldPassword, newPassword);
    if (result) {
      ReturnJson.ok(res, result);
    } else {
      req.session.token = '';
      res.clearCookie('token');
      res.clearCookie('username');
      ReturnJson.ok(res, '');
    }
  }));
}

