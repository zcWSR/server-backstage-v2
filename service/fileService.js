const fs = require('fs');
const POST_REGEXP = /(^---*\s*\n(\w+:.*\n)+---*\s*\n)/ig;
const MORE_REGEXP = /\n\s*<!--\s*more\s*-->\s*\n/i;
const HEADER_REGEXP = /(\w+):\s(.*)\n/ig;

/**
 * 
 * @param {string} path 文件路径
 * @param {string} post 文章对象
 */
function createPostFile(path, post) {
  return new Promise((resolve, reject) => {
    let top = '---\n' +
    'title: ' + post.title + '\n' +
    'date: ' + post.date + '\n' +
    'category: ' + post.category + '\n' +
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
        let post = {};
        let meta = data.toString();
        let tops = meta.match(POST_REGEXP);
        if (!tops || tops.length === 0) {
          reject(new Error('invalid header infos'));
        } else {
          let top = tops[0];
          let match;
          while(match = HEADER_REGEXP.exec(top)) {
            if (match[2])
              post[match[1]] = match[2];
            else
              post[match[1]] = '';
          }
          post.title = post.title.trim();
          post.labels = post.labels.trim().split(' ').filter(v => v);
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
 * @param {string} withHeader 传进来的content是否包含文章头
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


function updatePostTime(filePath, mtime) {
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
  updatePostTime
}