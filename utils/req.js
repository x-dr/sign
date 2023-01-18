import axios from 'axios';

export const requestPromise = async (params) => {
    return axios({
        url: params.url,
        method: params.method || 'POST',
        headers: params.headers || headers,
        data: params.body,
        validateStatus: status => {
            return status >= 200 && status < 400;
        },
        maxRedirects: 0
    })
        .then(res => {
            return res;
        })
        .catch(err => {
            return err;
        })
}