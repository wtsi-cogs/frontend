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