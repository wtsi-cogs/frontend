import React from 'react';

import axios from 'axios';
import Alert from 'react-s-alert';

// Install an Axios interceptor which displays an alert (small transient
// pop-up in the top-right corner, currently) whenever a request fails
// (HTTP status >= 400).
//
// If the request included a header called "_axios", this fallback error
// handler will be disabled. (Why "_axios" rather than something like
// "x-no-fallback-error-handler"? Not a clue.)
//
// If the failure was due to an authentication problem (e.g. session
// expired, user is not logged in), then the user will be redirected to
// the login page when the pop-up closes.
export default function catchErrors() {
    // Add an alert whenever a request fails.
    axios.interceptors.response.use(undefined, (error) => {
        // If the method does its own error handling, don't report here
        if (error.config.headers.hasOwnProperty("_axios")) return Promise.reject(error);
        const resp = error.response;
        let msg = "";
        if (resp == null) {
            msg = <p>{error.message}</p>;
        }
        else if (typeof resp.data === 'string') {
            msg = <p>{resp.status}: {resp.statusText}<br/>{resp.data.split("\n").map((line, i) => <span key={i}>{line}<br/></span>)}</p>;
        }
        else if (resp.data.status_message) {
            msg = <p>{resp.data.status_message}</p>;
        }
        else {
            msg = <p>{resp.status}: {resp.statusText}<br/>{JSON.stringify(resp.data)}</p>;
        }
        Alert.error(msg, {onClose: () => {
            if (resp != null && resp.status === 401) {
                // Should only ever happen with authentication based issues
                window.location.replace("/login");
            }
        }});
        return Promise.reject(error);
    });
}
