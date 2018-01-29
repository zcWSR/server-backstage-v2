const request = require('request-promise')
const db = require('./db').db;

const blogHost;

if (process.env.ENV !== 'production') {
    blogHost = 'localhost:2333/blog'
} else {
    blogHost = 'blog-api.zcwsr.com';
}

async function fetchCategoryListWithCount () {
    const meta = await request({
        url: `${blogHost}/categories/with-count`,
        json: true
    });

    return meta.result || null;
}

async function fetchLabelListwithCount () {
    const meta = await request({
        url: `${blogHost}/lables/with-count`,
        json: true
    });

    return meta.result || null;
}

module.exports = {
    fetchCategoryListWithCount,
    fetchLabelListwithCount
}
