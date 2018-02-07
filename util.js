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
        uri: `${blogHost}/categories/with-count`,
        json: true
    });

    return meta.result || null;
}

async function fetchLabelListwithCount () {
    const meta = await request({
        uri: `${blogHost}/lables/with-count`,
        json: true
    });

    return meta.result || null;
}

async function uploadPost(post) {
    const meta = await request({
        method: 'POST',
        uri: `${blogHost}/posts/upload`,
        body: post,
        json: true
    });

    return meta.result || null;
}

async function fetchOnePostById (id) {
    const meta = await request({
        uri: `${blogHost}/posts/${id}`,
        json: true
    });
} 

async function fetchPostsByTitle (title) {
    const meta = await request({
        uri: `${blogHost}/posts/by-title/${title}`,
        json: true
    });

    return meta.result || null;
}

module.exports = {
    fetchCategoryListWithCount,
    fetchLabelListwithCount,
    uploadPost,
    fetchOnePostById,
    fetchPostsByTitle
}
