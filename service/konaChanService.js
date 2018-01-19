const { get } = require('http');

const host = 'konachan.com';

function getTagList(query) {
  return this.jsonClient(`/tag.json?${getParamString(query)}`);

}

function getImageList(query) {
  'rating:safe+'
  return this.jsonClient(`/post.json?${getParamString(query)}`);
}

function getParamString(query) {
  let params = [];
  for (let i in query) {
    params = params.concat(`${i}=${query[i]}`);
  }
  return params.join('&');
}

function jsonClient(url) {
  return new Promise((resolve, reject) => {
    get({
      hostname: this.host,
      path: url,
      port: '80',
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.133 Safari/537.36'
      }
    },
      (res) => {
        const { statusCode } = res;
        const contentType = res.headers['content-type'];
        if (statusCode !== 200)
          resolve({ code: statusCode, error: 'proxy error' });
        else if (/^application\/json^/.test(contentType)) {
          resolve({
            code: statusCode, error: `Invalid content-type.\n` +
              `Expected application/json but received ${contentType}`
          });
        }

        res.setEncoding('utf-8');
        let rawData = '';
        res.on('data', (chunk) => { rawData += chunk });
        res.on('end', () => {
          resolve({ code: statusCode, result: JSON.parse(rawData) });
        })
      })
  })
}

module.exports = {
  getImageList,
  getTagList
}