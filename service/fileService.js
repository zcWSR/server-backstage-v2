const fs = require('fs');
const POST_REGEXP = /(^---*\s*\n(\w+:.*\n)+---*\s*\n)/ig;
const MORE_REGEXP = /\n\s*<!--\s*more\s*-->\s*\n/i;

/**
 * 
 * @param {string} path 文件路径
 * @param {string} post 文章对象
 */
function createPostFile(path, post) {
  return new Promise((reslove, reject) => {
    let top = '---\n' +
    'title: ' + post.title + '\n' +
    'date: ' + post.date + '\n' +
    'categories: ' + post.categories.join(' ') + '\n' +
    'labels: ' + post.labels.join(' ') + '\n' +
    '---\n\n';
    if (post.section) {
      top += post.section;
    }
    if (post.rest) {
      top += '\n<!-- more -->\n' + post.rest;
    }
    fs.writeFile(path, top, error => {
      if (error)
        reject(error);
      else
        resolve(top);
    });
  });
}

/**
 * 
 * @param {string} path 文章路径
 */
function getPostFileInfo (filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, data) => {
      if (error) reject(error);
      else {
        let post;
        let meta = data.toString();
        let tops = meta.match(POST_REGEXP);
        if (!tops || tops.length === 0) {
          reject(new Error('invalid header infos'));
        } else {
          let top = tops[0];

          top.match(/(\w+:.*)\n/ig).map(value => value.trim()).forEach(value => {
            let index = value.search(':');
            if (index === -1) return ;
            let key = value.slice(0, index).trim();
            value = value.slice(index + 1, value.length).trim();
            switch (key) {
              case 'title': 
                post.title = value.trim();
                break;
              case 'date':
                post.date = new Date(value);
                break;
              case 'category':
                post.category = value;
                break;
              case 'label':
                post[key] = value.trim().split(' ').filter(v => v);
                break;
              default:
                break;
            }
          });
        }
        post = Object.assign({}, post, splitContent(meta, true));
        resolve(post);
      }
    });
  })
}

/**
 * 
 * @param {string} content 文章内容
 * @param {string} withHeader 是否带文章头
 */
function splitContent (content, withHeader = false) {
  if (withHeader)
    content = content.replace(POST_REGEXP, '');
  let split = content.split(MORE_REGEXP);
  return {
    section: split[0],
    rest: split[1] || ''
  };
}


function updataPostTime(filePath, mtime) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (error, data) => {
      if (error) reject(error);
      else {
        let meta = data.toString();
        let top = '';
        let tops = meta.match(POST_REGEXP);
        if (!tops || tops.length === 0) {
          reject(new Error('invlaid header infos'));
        } else {
          top = tops[0];
          let content = meta.replace(POST_REGEXP, '');
          let date = top.match(/date\s*:\s*.*/);
          let headers = top.split('');
          headers.splice(date.index, date[0].length, `date: ${mtime}`)
          meta = headers.join('') + content;
          resolve(meta);
        }
      }
    });
  })
    .then(meta => {
      return new Promise((resolve, reject) => {
        fs.writeFile(filePath, meta, error => {
          if (error) reject(error);
          else resolve();
        });
      })
    });
  return promise;
}

module.exports = {
  createPostFile,
  getPostFileInfo,
  splitContent,
  updataPostTime
}