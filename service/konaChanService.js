import { get } from 'https';

const host = 'konachan.com';

export function getTagList(query) {
  return jsonClient(`/tag.json?${getParamString(query)}`);

}

export function getImageList(query) {
  'rating:safe+'
  return jsonClient(`/post.json?${getParamString(query)}`);
}

function getParamString(query) {
  let params = [];
  for (let i in query) {
    params = params.concat(`${i}=${query[i]}`);
  }
  return params.join('&');
}

function jsonClient(url) {
  console.log(host + url)
  return new Promise((resolve, reject) => {
    get({
      hostname: host,
      path: url,
      port: 443,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      }
    },
      (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
        if (/^application\/json^/.test(contentType)) {
          resolve({
            code: statusCode, error: `Invalid content-type.\n` +
              `Expected application/json but received ${contentType}`
          });
        }

        res.setEncoding('utf-8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk });
        res.on('end', () => {
          try {
            resolve({ code: statusCode, result: JSON.parse(rawData) });
          } catch (e) {
            resolve({ code: statusCode, error: rawData });
          }
        })
      })
  })
}