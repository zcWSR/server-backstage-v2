import ReturnJson from '../utils/return-json';
import * as AdminService from '../service/adminService';
import catchAsyncError from '../utils/catchAsyncError';

async function checkLoginMiddleware(req, res, next) {
  const cookieToken = req.signedCookies.token;
  const sessionToken = req.session.token;
  if (cookieToken && sessionToken) {
    if (cookieToken === sessionToken) { next(); }
    else {
      ReturnJson.error(res, '请登录', -2);
      return;
    }
  } else if (cookieToken && !sessionToken) {
    const user = await AdminService.queryUserByToken(cookieToken);
    if (!user) { ReturnJson.error(res, '解析用户信息出错, 请清除cookie重试'); return; }
    const newToken = AdminService.genToken(user.username);
    req.session.token = newToken;
    res.cookie('token', newToken, { maxAge: 1000 * 60 * 60 * 24 * 10, signed: true });
    res.cookie('username', user.username);
    await AdminService.updateToken(user.username, newToken);
    next();
  } else {
    ReturnJson.error(res, '请登录', -2);
    return;
  }
}


export default catchAsyncError(checkLoginMiddleware);
