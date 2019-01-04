import React from 'react';

import axios from 'axios';
import Alert from 'react-s-alert';

export default function catchErrors() {
    // Add an alert whenever a request fails.
    axios.interceptors.response.use(undefined, (error) => {
        // If the method does it's own error handling, don't report here
        if (error.config.headers.hasOwnProperty("_axios")) return Promise.reject(error);
        const resp = error.response;
        let msg = "";
        if (typeof resp.data === 'string') {
            msg = <p>{resp.status}: {resp.statusText}<br/>{resp.data.split("\n").map((line, i) => <span key={i}>{line}<br/></span>)}</p>;
        }
        else if (resp.data.status_message) {
            msg = <p>{resp.data.status_message}</p>;
        }
        else {
            msg = <p>{resp.status}: {resp.statusText}<br/>{JSON.stringify(resp.data)}</p>;
        }
        Alert.error(msg, {onClose: () => {
            if (resp.status === 401) {
                // Should only ever happen with authentication based issues
                window.location.replace("/login");
            }
        }});
        return Promise.reject(error);
    });
}