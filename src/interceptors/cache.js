import axios from 'axios';
import Cache from 'js-cache';

// Get a string representation of a request.
function getUri(request) {
    return JSON.stringify({
        method: request.method,
        url: request.url,
        params: request.params || {}
    });
}

// Install an Axios interceptor that caches in-flight requests.
//
// This works by swapping out the request adapter (the thing that
// actually makes a request, and returns a promise that will settle with
// the result of the request) with a function that just returns the
// promise from the already-in-flight request -- so if you call
// `axios.get` with the same URL twice, the second call will piggy-back
// on the first call's network request.
//
// Cache entries are thrown away as soon as the response is received, so
// it's not clear how effective this actually is at reducing the number
// of network requests. It's very tempting to just stick a
// setTimeout(..., 1000) around the whole remove-from-cache bit of the
// response interceptor to keep things in the cache for slightly longer.
export default function cacheRequests() {
    const cache = new Cache();
    // Only cache responses to GET requests. (Since PUTs are
    // theoretically idempotent, it should be possible to also cache
    // those, but we'd have to index the cache by the request body as
    // well in that case, and it's probably not worth the bother.)
    const methods = ["get"]

    // Add an entry to the cache if there's no existing cache entry for
    // this URL, or apply the cache entry to the request before it gets
    // around to actually making a network request.
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

    // Remove cache entries for completed requests.
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
