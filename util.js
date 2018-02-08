import * as request from 'request-promise-native';
import fs from 'fs';
import path from 'path';
import requireAll from 'require-all';
import { Router } from 'express';
import express from 'express';


import { db } from './db';

let blogHost;

if (process.env.ENV !== 'production') {
    blogHost = 'http://127.0.0.1:2333/blog'
} else {
    blogHost = 'http://blog-api.zcwsr.com';
}

export async function fetchCategoryListWithCount () {
    const meta = await request({
        uri: `${blogHost}/categories/with-count`,
        json: true
    });

    return meta.result || null;
}

export async function fetchLabelListwithCount () {
    const meta = await request({
        uri: `${blogHost}/labels/with-count`,
        json: true
    });

    return meta.result || null;
}

export async function uploadPost(post) {
    const meta = await request({
        method: 'POST',
        uri: `${blogHost}/posts/upload`,
        body: post,
        json: true
    });

    return meta.result || null;
}

export async function fetchOnePostById (id) {
    const meta = await request({
        uri: `${blogHost}/posts/${id}`,
        json: true
    });
} 

export async function fetchPostsByTitle (title) {
    const meta = await request({
        uri: `${blogHost}/posts/by-title/${title}`,
        json: true
    });

    return meta.result || null;
}

/**
 * 自动扫描routes下的文件夹,并以文件夹名作为根路由
 * @param {express} app 
 */
export function setRoutes(app) {
    const routerNames = fs.readdirSync(path.resolve(__dirname, 'routes'));
    for (let routerName of routerNames) {
        const router = Router();
        const dirPath = path.resolve(__dirname, 'routes', routerName);
        execRequires(requireAll(dirPath), router);
        app.use(`/${routerName}`, router);
    }
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
