import * as request from 'request-promise-native';

let blogHost;

if (process.env.ENV !== 'production') {
    blogHost = 'http://127.0.0.1:2333/blog'
} else {
    blogHost = 'http://blog-api.zcwsr.com';
}

export async function fetchCategoryListWithCount () {
    const meta = await request({
        uri: `${blogHost}/categories/with-count`,
        json: true
    });

    return meta.result || null;
}

export async function fetchLabelListwithCount () {
    const meta = await request({
        uri: `${blogHost}/labels/with-count`,
        json: true
    });

    return meta.result || null;
}

export async function uploadPost(post) {
    const meta = await request({
        method: 'POST',
        uri: `${blogHost}/posts/upload`,
        body: post,
        json: true
    });

    return meta.result || null;
}

export async function fetchOnePostById (id) {
    const meta = await request({
        uri: `${blogHost}/posts/${id}`,
        json: true
    });
} 

export async function fetchPostsByTitle (title) {
    const meta = await request({
        uri: `${blogHost}/posts/by-title/${title}`,
        json: true
    });

    return meta.result || null;
}