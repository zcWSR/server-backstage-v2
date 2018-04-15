export default class RetrunJson {
  static VERSION = '2.5';

  static ok(res, data, jsonp = true) {
    const result = {
      data,
      errcode: 0,
      ret: true,
      ver: RetrunJson.VERSION
    };
    if (process.env.ENV === 'dev') {
      setTimeout(() => {
        RetrunJson.returnResult(res, result, jsonp);
      }, 500);
    } else {
      RetrunJson.returnResult(res, result, jsonp);
    }
  }

  static error(res, error, errcode = -1, jsonp = true) {
    const result = {
      data: null,
      errmsg: error,
      errcode,
      ret: false,
      ver: RetrunJson.VERSION
    };
    if (process.env.ENV === 'dev') {
      setTimeout(() => {
        RetrunJson.returnResult(res, result, jsonp);
      }, 500);
    } else {
      RetrunJson.returnResult(res, result, jsonp);
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