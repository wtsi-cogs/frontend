/*
Copyright (c) 2018 Genome Research Ltd.

Authors:
* Simon Beal <sb48@sanger.ac.uk>

This program is free software: you can redistribute it and/or modify it
under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or (at
your option) any later version.

This program is distributed in the hope that it will be useful, but
WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero
General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

import { push } from 'connected-react-router'
import axios from 'axios';

import {api_url} from '../config.js';

export const SET_AUTHENTICATE = "SET_AUTHENTICATE";
export const SET_TOKEN = "SET_TOKEN";

export const NONE = "NONE"; 
export const AUTHENTICATED = "AUTHENTICATED";

export const authenticators = {"NONE": "NONE", "PAGESMITH": "PAGESMITH"};
export const authenticator = authenticators.PAGESMITH;


function setStage(stage) {
    return {
        type: SET_AUTHENTICATE,
        stage
    }
}

function setToken(stage) {
    return {
        type: SET_TOKEN,
        stage
    }
}

function pagesmithAuth(dispatch, state) {
    const pagesmith_cookie = state.authenticate.token;
    if (pagesmith_cookie === undefined) {
        axios.get(`${api_url}/api/cookie_thief`, {params: {"cookie": "Pagesmith_User"}}).then(response => {
            dispatch(setToken(response.data));
        });
        return;
    }
    if (pagesmith_cookie === "") {
        dispatch(push("/login"));
        return
    }
    axios.defaults.headers.common["Authorization"] = "Pagesmith "+pagesmith_cookie.replace(/\s/g, "");
    return dispatch(setStage(AUTHENTICATED));
}

export function authenticate() {
    return function (dispatch, getState) {
        const state = getState();
        switch (authenticator) {
            case authenticators.PAGESMITH:
                return pagesmithAuth(dispatch, state);
            default:
                return dispatch(setStage(AUTHENTICATED));
        }
    }
}
