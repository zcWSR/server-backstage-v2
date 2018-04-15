import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import Images from 'images';

import * as PostService from '../../service/postService';
import ReturnJson from '../../utils/return-json';
import ImageUtil from '../../utils/img';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/about', (req, res) => {
    fs.readFile(path.resolve(__dirname, '../../src/about.md'), (error, data) => {
      if (error)
        ReturnJson.error(res, error);
      else
        ReturnJson.ok(res, data.toString());
    });
  });
  
  router.get('/resume', (req, res) => {
    fs.readFile(path.resolve(__dirname, '../../src/resume.md'), (error, data) => {
      if (error)
      ReturnJson.error(res, error);
      else
      ReturnJson.ok(res, data.toString());
    });
  });

  async function getMainColor(name) {
    const filePath = path.resolve(__dirname, `../../src/imgs/${name}`);
    const imgbuffer = Images(filePath).size(200).encode('jpg');
    // const imgbuffer = fs.readFileSync(filePath);
    const color = await ImageUtil.getDomainColor(imgbuffer);
    return { name, color }; 

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
        ReturnJson.error(res, error);
      else {
        const filenames = files.filter(file => file !== '.DS_Store');
        getFiles(filenames).then(result => {
          ReturnJson.ok(res, result);
        });
      }
    });
  });

  router.get('/imgs/random', (req, res) => {
    fs.readdir(path.resolve(__dirname, '../../src/imgs'), (error, files) => {
      if (error)
        ReturnJson.error(res, error);
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
        ReturnJson.error(res, error);
      else {
        res.writeHead(200, { 'Content-Type': 'image/jpeg' });
        res.end(data, 'binary');
      }
    });
  });
}