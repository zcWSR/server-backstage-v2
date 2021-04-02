import { Router } from 'express';
import CatchAsyncError from '../../utils/catchAsyncError';

/**
 *
 * @param {Router} router
 */
export default function (router) {
  router.get(
    '/',
    CatchAsyncError(async (req, res) => {
      let message = '<h1>a simple command based OSU! game info searching qq-bot</h1>';
      message +=
        '<h2>get more info on my <a href="https://github.com/zcWSR/server-backstage-v2/tree/master/routes/japari-qqbot">github</a></h2>';
      res.send(message);
    })
  );
}
