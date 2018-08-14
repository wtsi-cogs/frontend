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
import update from 'immutability-helper';
import {requestProjects, receiveProject} from './projects.js';

export const FETCH_USERS = 'FETCH_USERS';
export const REQUEST_USERS = 'REQUEST_USERS';
export const RECEIVE_USER = 'RECEIVE_USER';

export const FETCH_ME = 'FETCH_ME';
export const REQUEST_ME = 'REQUEST_ME';
export const RECEIVE_ME = 'RECEIVE_ME';

export const VOTE_PROJECT = 'VOTE_PROJECT';

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

export function fetchUser(userID) {
    return function (dispatch) {
        dispatch(requestUsers(1));
        axios.get(`${api_url}/api/users/${userID}`).then(response => {
            const user = response.data;
            dispatch(receiveUser(user));
        });
    }
}

export function fetchMe() {
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

export function voteProject(projectID, option) {
    function getLinkKey(option) {return `choice_${option}`}
    function getDataKey(option) {return [null, "first", "second", "third"][option] + "_option_id"}

    return function (dispatch, getState) {
        axios.put(`${api_url}/api/users/me/vote`, {
            project_id: projectID,
            choice: option
        }).then(response => {
            const state = getState();
            let me = state.users.users[state.users.loggedInID];
            for (var i=1; i < 4; i++) {
                if (me.links[getLinkKey(i)] === `/api/projects/${projectID}`) {
                    me = update(me, {links: {$merge: {[getLinkKey(i)]: null}}});
                }
                if (me.data[getDataKey(i)] === projectID) {
                    me = update(me, {data: {$merge: {[getDataKey(i)]: null}}});
                }
            } 
            me = update(me, {
                links: {$merge: {[getLinkKey(option)]: `/api/projects/${projectID}`}},
                data: {$merge: {[getDataKey(option)]: projectID}}});
            console.log(me);
            dispatch(receiveUser(me));
        });
    }
}

export function canMark(user, project) {
    if (project.grace_passed) {
        if ((user.data.id === project.supervisor_id && project.supervisor_feedback_id !== null) ||
            (user.data.id === project.cogs_marker_id && project.cogs_feedback_id !== null)) {
                return true;
        }
    }
    return false
}

export function getSupervisorProjects(user) {
    return function (dispatch) {
        const projects = user.links.supervisor_projects;
        dispatch(requestProjects(projects.length));
        projects.forEach(link => {
            axios.get(`${api_url}${link}`).then(response => {
                dispatch(receiveProject(response.data));
            });
        })
    }
}

export function getCogsProjects(user) {
    return function (dispatch) {
        const projects = user.links.cogs_projects;
        dispatch(requestProjects(projects.length));
        projects.forEach(link => {
            axios.get(`${api_url}${link}`).then(response => {
                dispatch(receiveProject(response.data));
            });
        })
    }
}