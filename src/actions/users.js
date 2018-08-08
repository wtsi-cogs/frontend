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


import axios from 'axios';
import api_url from '../config.js';


export const FETCH_USERS = 'FETCH_USERS';
export const REQUEST_USERS = 'REQUEST_USERS';
export const RECEIVE_USER = 'RECEIVE_USER';

export const FETCH_ME = 'FETCH_ME';
export const REQUEST_ME = 'REQUEST_ME';
export const RECEIVE_ME = 'RECEIVE_ME';

function requestUsers(noUsers) {
    return {
        type: REQUEST_USERS,
        noUsers
    }
}

function receiveUser(user) {
    return {
        type: RECEIVE_USER,
        user
    }
}

function requestMe() {
    return {
        type: REQUEST_ME,
    }
}

function receiveMe(userID) {
    return {
        type: RECEIVE_ME,
        userID
    }
}

export default function fetchMe() {
    return function (dispatch) {
        dispatch(requestUsers(1));
        dispatch(requestMe());
        axios.get(`${api_url}/api/users/me`).then(response => {
            const user = response.data;
            dispatch(receiveUser(user));
            dispatch(receiveMe(user.data.id));
        });
    }
}