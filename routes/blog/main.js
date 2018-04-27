import { Router } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';
import ReturnJson from '../../utils/return-json';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/', (req, res) => {
    res.send('hello, blog!');
  })

  router.get('/config', CatchAsyncError(async (req, res) => {
    const defaultConfig = await {
      blogName: 'zcWSR',
      slogen: '靡不有初, 鲜克有终',
      bgUrl: 'http://files.zcwsr.com/server-backstage-v2/src/imgs/bg5.jpg',
      bgColor: '#4e7cb4',
      postListPageSize: 5,
      articles: [
        { id: 1, route: 'resume', shortName: 'resume' },
        { id: 2, route: 'aboutme', shortName: '关于我' }
      ]
    };
    ReturnJson.ok(res, defaultConfig);
  }));
}