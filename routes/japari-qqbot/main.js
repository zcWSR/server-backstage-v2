import { Router } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import path from 'path';
import fs from 'fs';
import logger from '../../utils/logger';
import { createQQBotTable } from '../../qqbot-plugins/db'
import * as BotService from '../../service/botService';

export let groupConfigMap = {};
createQQBotTable().then(() => {
  return BotService.loadGroupConfig();
}).then(config => {
  logger.info('群插件配置加载成功');
  groupConfigMap = config;
}).catch(e => {
  logger.error(e);
});

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  const pluginMap = loadPlugins();

  router.get('/', CatchAsyncError(async (req, res) => {
    res.send(`<h1>a simple command based OSU! game info searching qq-bot</h1><h2>get more info on my <a href="">github</a></h2>`);
  }));

  router.post('/', CatchAsyncError(async (req, res) => {
    const body = req.body;
    const plugins = pluginMap[body.post_type];
    if (plugins) {
      plugins.every(plugin => {
        return plugin.go(body, plugins);
      });
    }    
    res.status(204);
    res.json('');
  }));

  function loadPlugins() {
    logger.info('================qqbot-plugin================')
    const pluginsPath = path.resolve(__dirname, '../../qqbot-plugins');
    const pluginMap = fs.readdirSync(pluginsPath)
      .filter(value => /\.js$/.test(value))
      .reduce((prev, curr) => {
        let pluginCates = curr.match(/[\w+\-?]+\.(.*).js/);
        if (pluginCates) {
          pluginCates = pluginCates[1].split('.');
          pluginCates.forEach(cate => {
            try {
              const plugin = require(`${pluginsPath}/${curr}`);
              if (plugin.name && (plugin.weight || plugin.weight === 0)) {
                prev[cate] = [plugin, ...(prev[cate] || [])];
                logger.info(`${cate}插件'${plugin.name}'加载成功, 权重: ${plugin.weight}`)
              } else {
                throw new Error(`插件加载失败,缺少必要属性\n位于: ${path}`);
              }
            } catch (e) {
              logger.error(e);
            }
          });
        }
        return prev;
      }, {})
      logger.info('按权重从大到小排序:');
      Object.keys(pluginMap).forEach(cate => {
        logger.info(`${cate}:`);
        pluginMap[cate] = pluginMap[cate].sort((a, b) => {
          b.weight = b.weight || 0;
          a.weight = a.weight || 0;
          return b.weight - a.weight;
        });
        pluginMap[cate].forEach(plugin => {
          logger.info(`[${plugin.name}]`);
        });
      });
    logger.info('插件加载完成');
    logger.info('================qqbot-plugin================');
    return pluginMap;
  }
}
