export default class ReturnJson {
  static VERSION = '2.5';

  static ok(res, data, jsonp = true) {
    const result = {
      data,
      errcode: 0,
      ret: true,
      ver: ReturnJson.VERSION
    };
    if (process.env.ENV === 'dev') {
      setTimeout(() => {
        ReturnJson.returnResult(res, result, jsonp);
      }, 500);
    } else {
      ReturnJson.returnResult(res, result, jsonp);
    }
  }

  static error(res, error, errcode = -1, jsonp = true) {
    const result = {
      data: null,
      errmsg: error,
      errcode,
      ret: false,
      ver: ReturnJson.VERSION
    };
    if (process.env.ENV === 'dev') {
      setTimeout(() => {
        ReturnJson.returnResult(res, result, jsonp);
      }, 500);
    } else {
      ReturnJson.returnResult(res, result, jsonp);
    }
  }

  static returnResult(res, result, isJonsp) {
    if (isJonsp) {
      res.jsonp(result);
    } else {
      res.json(result);
    }
  }
}