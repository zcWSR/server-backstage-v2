export default class RetrunJson {
  static VERSION = '2.5';

  static ok(res, data, jsonp = true) {
    const result = {
      data,
      errcode: 0,
      ret: true,
      ver: RetrunJson.VERSION
    };
    if (jsonp) {
      res.jsonp(result);
    } else {
      res.json(result);
    }
  }

  static error(res, error, errcode = -1, jsonp = true) {
    const result = {
      errmsg: error,
      errcode,
      ret: false,
      ver: RetrunJson.VERSION
    };
    if (jsonp) {
      res.jsonp(result);
    } else {
      res.json(result);
    }
  }
}