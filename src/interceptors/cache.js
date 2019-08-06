import axios from 'axios';
import Cache from 'js-cache';


function getUri(request) {
    return JSON.stringify({
        method: request.method,
        url: request.url,
        params: request.params || {}
    });
}


export default function cacheRequests() {
    const cache = new Cache();
    const methods = ["get"]
    axios.interceptors.request.use(request => {
        if (methods.includes(request.method)) {
            const uri = getUri(request)
            const cached = cache.get(uri);
            if (cached) {
                request.adapter = () => {
                    return cached.promise;
                };
            }
            else {
                var pResolve;
                var pReject;
                const promise = new Promise((resolve, reject) => {
                    pResolve = resolve;
                    pReject = reject;
                });
                cache.set(uri, {promise, resolve: pResolve, reject: pReject});
            }
        };
        return request;
    });

    axios.interceptors.response.use(response => {
        if (methods.includes(response.config.method)) {
            const uri = getUri(response.config);
            const cached = cache.get(uri);
            if (cached !== undefined) {
                cached.resolve({
                    data: response.data,
                    status: response.status,
                    statusText: response.statusText,
                    config: response.config,
                    headers: response.headers
                });
                cache.del(uri);
            } else {
                // Although we substitute the request adapter to return one
                // promise for many requests, Axios still calls response
                // interceptors once for each request, so if the cache is any
                // use at all, this response interceptor will be invoked
                // multiple times for the same URI.
            }
        };
        return response;
    },
    error => {
        if (methods.includes(error.config.method)) {
            const uri = getUri(error.config);
            const cached = cache.get(uri);
            if (cached !== undefined) {
                cached.reject(error);
                cache.del(uri);
            } else {
                // See above.
            }
        };
        return Promise.reject(error);
    });
}
