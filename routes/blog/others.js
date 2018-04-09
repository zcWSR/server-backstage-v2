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
    fs.readFile(path.resolve(__dirname, '../src/about.md'), (err, data) => {
      if (error)
        res.status(500).jsonp({ error });
      else
        res.jsonp({ result: data.toString() });
    });
  });
  
  router.get('/resume', (req, res) => {
    fs.readFile(path.resolve(__dirname, '../src/resume.md'), (err, data) => {
      if (error)
        res.status(500).jsonp({ error });
      else
        res.jsonp({ result: data.toString() });
    });
  });
  
  router.get('/imgs', (req, res) => {
    fs.readdir(path.resolve(__dirname, '../src/img'), (err, files) => {
      if (error)
        res.status(500).jsonp({ error });
      else
        res.jsonp({ result: files.filter(file => file !== '.DS_Store') });
    });
  });

  route.get('/imgs/random', (req, res) => {
    fs.readdir(path.resolve(__dirname, '../src/img'), (err, files) => {
      if (error) res.status(500).jsonp({ error });
      else {
        const filePath = files[Math.floor((Math.random() * files.length))];
        fs.readFile(filePath, (err, data) => {
          if (err) res.status(500).jsonp({ error });
          else {
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(data, 'binay');
          }
        });
      }
    });
  });
  
  router.get('/imgs/:name', (req, res) => {
    fs.readFile(path.resolve(__dirname, `../src/img/${req.params.name}`), (err, data) => {
      if (error)
        res.status(500).jsonp({ error });
      else {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data, 'binary');
      }
    });
  });
}