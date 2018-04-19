import { Router } from 'express';
import ReturnJson from '../../utils/return-json';

/**
 * 
 * @param {Router} router 
 */
export default function (router) {
  router.get('/', (req, res) => {
    res.send('hello, blog!');
  })

  router.get('/config', (req, res) => {
    const defaultConfig = {
      blogName: 'zcWSR',
      slogen: '靡不有初, 鲜克有终',
      hostBg: {
        url: 'http://files.zcwsr.com/server-backstage-v2/src/imgs/bg5.jpg',
        mainColor: '#4e7cb4'
      },
      postListPageSize: 5,
      articles: [
        { id: 1, route: 'resume', shortName: 'resume' },
        { id: 2, route: 'aboutme', shortName: '关于我' }
      ]
    };
    ReturnJson.ok(res, defaultConfig);
  })
}