import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import img from 'images';
import thmclrx from 'thmclrx';

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

  function getMainColor(name) {
    return new Promise((resolve, reject) => {
      const filePath = path.resolve(__dirname, `../../src/imgs/${name}`);
      const imgbuffer = img(filePath).size(200).encode('jpg', {operation:50});
      thmclrx.octree(imgbuffer, 256, (error, colors) => {
        resolve({ name, color: colors[0].color });
      });
    });
  }

  async function getFiles(filenames) {
    const result = [];
    for (let filename of filenames) {
      const a = await getMainColor(filename);
      result.push(a);
    }
    return result;
  }
  
  router.get('/imgs', (req, res) => {
    fs.readdir(path.resolve(__dirname, '../../src/imgs'), (error, files) => {
      if (error)
        res.status(500).jsonp({ error });
      else {
        const filenames = files.filter(file => file !== '.DS_Store');
        getFiles(filenames).then(result => {
          res.jsonp({ result });
        });
      }
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