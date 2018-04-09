import fs from 'fs';
import path from 'path';
import requireAll from 'require-all';
import { Router } from 'express';
import express from 'express';

import { db } from '../db';

/**
 * 自动扫描routes下的文件夹,并按文件夹对路由模块进行挂载
 * @param {express} app 
 */
export function setRoutes(app) {
    const routerNames = fs.readdirSync(path.resolve(__dirname, '../', 'routes/'))
        .map(name => {
            // 如果文件夹名为main则识别为根
            if (name === 'main') return '';
            else return name;
        });
    for (let routerName of routerNames) {
        const router = Router();
        const dirPath = path.resolve(__dirname, '../routes/', routerName || 'main');
        console.log(dirPath);
        execRequires(requireAll(dirPath), router);
        console.log(`/${routerName}`);
        app.use(`/${routerName}`, router);
    }
}

/**
 * 执行从require-all中导出的函数
 * @param {{}} requireMap requireMap
 * @param {*} params 待传入的参数
 */
export function execRequires(requireMap, params) {
    console.log(requireMap);
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
