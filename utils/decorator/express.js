import { Router } from 'express';

/**
 * 抓取异步异常的装饰器
 */
export function catchError () {
  const decorator = (t, n, descriptor) => {
    console.log(t);
    let origin = descriptor.value;
    return (req, res, next) => {
      origin(req, res).catch(next);
    }
  }
  return decorator;
}

// /**
//  * 
//  * @param {{router: Router, method, path: string, middlewires: [], mws?: []}} options 
//  */
// export function Route (options) {
//   if (typeof options === 'string') {
//     options = { path: options };
//   }


// }