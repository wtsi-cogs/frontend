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
            cache.get(uri).resolve({
                data: response.data,
                status: response.status,
                statusText: response.statusText,
                config: response.config,
                headers: response.headers
            });
            cache.del(uri);
        };
        return response;
    },
    error => {
        if (methods.includes(error.response.config.method)) {
            const uri = getUri(error.response.config);
            cache.get(uri).reject(error);
            cache.del(uri);
        };
        return Promise.reject(error);
    });
}