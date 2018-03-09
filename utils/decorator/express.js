import { Router } from 'express';

/**
 * 抓取异步异常的装饰器
 */
export function catchError () {
  const decorator = (descriptor) => {
    console.log(descriptor.value);
    let origin = descriptor.value;
    descriptor.value = (req, res, next) => {
      origin(req, res).catch(next);
    }
    return descriptor;
  }
}

// export function Catch (instance) {
//   const origin = instance.value;
//   console.log('decorator');
//   return (req, res, next) {
    
//   }
// }

// /**
//  * 
//  * @param {{router: Router, method, path: string, middlewires: [], mws?: []}} options 
//  */
// export function Route (options) {
//   if (typeof options === 'string') {
//     options = { path: options };
//   }


// }