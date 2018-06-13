import { Router } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import path from 'path';
import fs from 'fs';
const Log = require('log');

const logger = new Log('japari-qqbot');

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  const plugins = loadPlugins();
  router.post('/', CatchAsyncError(async (req, res) => {
    const body = req.body;
    let isEnd = false;
    plugins.every((plugin) => {
      return plugin.go(req.body, res, plugins);
    });
    res.json({});
  }));

  function loadPlugins() {
    logger.info('================qqbot-plugin================')
    const pluginsPath = path.resolve(__dirname, '../../qqbot-plugins');
    const plugins = fs.readdirSync(pluginsPath)
      .filter(value => /\.js$/.test(value))
      .map(fileName => `${pluginsPath}/${fileName}`)
      .map(path => {
        let p;
        try {
          p = require(path);
          if (p.name && (p.weight || p.weight === 0)) {
            logger.info(`插件: '${p.name}' 加载成功, 权重: ${p.weight}`)
          } else {
            throw new Error(`插件加载失败,缺少必要属性\n位于: ${path}`);
          }
        } catch (e) {
          logger.warn(e);
        } finally {
          return p;
        }
      })
      .filter(p => p) // 过滤加载失败的插件
      .sort((a, b) => {
        const bWeight = b.weight || 0;
        const aWeight = a.weight || 0;
        return bWeight - aWeight;
      })
      .map((plugin, index) => {
        if (!index) {
          logger.info('按权重从大到小排序:');
        }
        logger.info(`[${plugin.name}]`);
        return plugin;
      });
    logger.info('插件加载完成');
    logger.info('================qqbot-plugin================');
    return plugins;
  }
}