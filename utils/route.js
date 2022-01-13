import fs from 'fs';
import path from 'path';
import requireAll from 'require-all';
import { Router } from 'express';
import express from 'express';
import logger from '../utils/logger';

/**
 * 自动扫描routes下的文件夹,并按文件夹对路由模块进行挂载
 * @param {express} app express对象
 * @param {string} prefix 路由总前缀
 */
export function setRoutes(app, prefix) {
    const routerNames = fs.readdirSync(path.resolve(__dirname, '../', 'routes/'))
        .map(name => {
            // 如果文件夹名为main则识别为根
            if (name === 'main') return '';
            else return name;
        });
    for (let routerName of routerNames) {
        const router = Router();
        const dirPath = path.resolve(__dirname, '../routes/', routerName || 'main');
        if (fs.lstatSync(dirPath).isDirectory()) {
            execRequires(requireAll(dirPath), router);
            app.use(`${prefix ? '/' + prefix : ''}/${routerName}`, router);
        }
    }
    logger.info('路由扫描完成');
}

/**
 * 执行从require-all中导出的函数
 * @param {{}} requireMap requireMap
 * @param {*} params 待传入的参数
 */
export function execRequires(requireMap, params) {
    for (let key of Object.keys(requireMap)) {
      const func = requireMap[key];
      switch (typeof func) {
        case 'function':
            func(params); break;
        case 'object':
            execRequires(func, params); break;
      }
    }
}
