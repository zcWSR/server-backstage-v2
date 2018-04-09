import { Router } from 'express';
import fs from 'fs';
import path from 'path';

import * as PostService from '../../service/postService';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/about', (req, res) => {
    fs.readFile(path.resolve(__dirname, '../../src/about.md'), (error, data) => {
      if (error)
        res.status(500).jsonp({ error });
      else
        res.jsonp({ result: data.toString() });
    });
  });
  
  router.get('/resume', (req, res) => {
    fs.readFile(path.resolve(__dirname, '../../src/resume.md'), (error, data) => {
      if (error)
        res.status(500).jsonp({ error });
      else
        res.jsonp({ result: data.toString() });
    });
  });
  
  router.get('/imgs', (req, res) => {
    fs.readdir(path.resolve(__dirname, '../../src/imgs'), (error, files) => {
      if (error)
        res.status(500).jsonp({ error });
      else
        res.jsonp({ result: files.filter(file => file !== '.DS_Store') });
    });
  });

  router.get('/imgs/random', (req, res) => {
    fs.readdir(path.resolve(__dirname, '../../src/imgs'), (error, files) => {
      if (error)
        res.status(500).jsonp({ error });
      else {
        const fileName = files[Math.floor((Math.random() * files.length))];
        res.redirect(`${fileName}`);
        // fs.readFile(path.resolve(__dirname, `../../src/imgs/${fileName}`), (error, data) => {
        //   if (error) res.status(500).jsonp({ error });
        //   else {
        //     res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        //     res.end(data, 'binay');
        //   }
        // });
      }
    });
  });
  
  router.get('/imgs/:name', (req, res) => {
    fs.readFile(path.resolve(__dirname, `../../src/imgs/${req.params.name}`), (error, data) => {
      if (error)
        res.status(500).jsonp({ error });
      else {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data, 'binary');
      }
    });
  });
}