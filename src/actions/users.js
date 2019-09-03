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
import {api_url} from '../config.js';
import update from 'immutability-helper';
import allSettled from 'promise.allsettled';
import {requestProjects, receiveProject} from './projects.js';
import {requestRotations, receiveRotation} from './rotations';

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

export function fetchUser(userID) {
    return function (dispatch) {
        dispatch(requestUsers(1));
        return axios.get(`${api_url}/api/users/${userID}`).then(response => {
            const user = response.data;
            dispatch(receiveUser(user));
        });
    }
}

export function fetchMe() {
    return function (dispatch) {
        dispatch(requestUsers(1));
        dispatch(requestMe());
        return axios.get(`${api_url}/api/users/me`).then(response => {
            const user = response.data;
            dispatch(receiveUser(user));
            dispatch(receiveMe(user.data.id));
        });
    }
}

export function fetchAllUsers() {
    return function (dispatch) {
        return axios.get(`${api_url}/api/users`).then(response => {
            const userLinks = Object.values(response.data.links);
            dispatch(requestUsers(userLinks.length));
            return allSettled(userLinks.map((link) => (
                axios.get(`${api_url}${link}`).then(response => {
                    const user = response.data;
                    dispatch(receiveUser(user));
                })
            )));
        });
    }
}

export function fetchUsersWithPermissions(permissions) {
    return function (dispatch) {
        return axios.get(`${api_url}/api/users/permissions`, {params: {permissions}}).then(response => {
            const userLinks = Object.values(response.data.links);
            dispatch(requestUsers(userLinks.length));
            return allSettled(userLinks.map((link) => (
                axios.get(`${api_url}${link}`).then(response => {
                    const user = response.data;
                    dispatch(receiveUser(user));
                })
            )));
        });
    }
}

export function saveUser(userID, user) {
    return function (dispatch) {
        dispatch(requestUsers(1));
        return axios.put(`${api_url}/api/users/${userID}`, user).then(response => {
            dispatch(receiveUser(response.data));
        });
    }
}

export function createUser(user) {
    return function (dispatch) {
        dispatch(requestUsers(1));
        return axios.post(`${api_url}/api/users`, user).then(response => {
            dispatch(receiveUser(response.data));
        });
    }
}

export function voteProject(projectID, option) {
    function getLinkKey(option) {return `choice_${option}`}
    function getDataKey(option) {return [null, "first", "second", "third"][option] + "_option_id"}

    return function (dispatch, getState) {
        return axios.put(`${api_url}/api/users/me/vote`, {
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
            dispatch(requestUsers(1));
            dispatch(receiveUser(me));
        });
    }
}

export const sendReceipt = rotationID => dispatch => (
    axios.post(`${api_url}/api/users/me/send_receipt`, {rotation: rotationID})
)

export function saveStudentProjects(choices, callback=()=>{}) {
    return function (dispatch) {
        return axios.put(`${api_url}/api/users/assign_projects`, {
            choices: choices
        }).then(response => {
            const projects = response.data.data.projects;
            dispatch(requestProjects(projects.length));
            projects.forEach(project => {
                dispatch(receiveProject(project));
            });
            const users = response.data.data.users;
            dispatch(requestUsers(users.length));
            users.forEach(user => {
                dispatch(receiveUser(user));
            });
            callback();
        });
    }
}


export function unsetVotes(callback=()=>{}) {
    return function (dispatch, getState) {
        const state = getState();
        return axios.post(`${api_url}/api/users/unset_votes`).then(response => {
            const priorities = response.data.data.priorities;
            dispatch(requestUsers(Object.keys(state.users.users).length));
            Object.values(state.users.users).forEach(user => {
                const newUser = update(user, {
                    links: {$merge: {
                        choice_1: null,
                        choice_2: null,
                        choice_3: null
                    }},
                    data: {$merge: {
                        first_option_id: null,
                        second_option_id: null,
                        third_option_id: null,
                        priority: priorities[user.data.id] || user.data.priority
                    }}
                });
                dispatch(receiveUser(newUser));
            });
            const latestRotationOld = state.rotations.rotations[state.rotations.latestID];
            const latestRotation = update(latestRotationOld, {
                data: {$merge: {
                    student_uploadable: true,
                    can_finalise: false,
                    student_choosable: false
                }}
            });
            dispatch(requestRotations(1));
            dispatch(receiveRotation(latestRotation));
            callback();
        });
    }
}

export function canMark(user, project) {
    if (project.data.grace_passed) {
        if ((user.data.id === project.data.supervisor_id && project.data.supervisor_feedback_id === null) ||
            (user.data.id === project.data.cogs_marker_id && project.data.cogs_feedback_id === null)) {
                return true;
        }
    }
    return false
}

export function getSupervisorProjects(user) {
    return function (dispatch) {
        const projects = user.links.supervisor_projects;
        dispatch(requestProjects(projects.length));
        return allSettled(projects.map(link => (
            axios.get(`${api_url}${link}`).then(response => {
                dispatch(receiveProject(response.data));
            })
        )));
    }
}

export function getCogsProjects(user) {
    return function (dispatch) {
        const projects = user.links.cogs_projects;
        dispatch(requestProjects(projects.length));
        return allSettled(projects.map(link => (
            axios.get(`${api_url}${link}`).then(response => {
                dispatch(receiveProject(response.data));
            })
        )));
    }
}

export function getStudentProjects(user) {
    return function (dispatch) {
        const projects = user.links.student_projects;
        dispatch(requestProjects(projects.length));
        return allSettled(projects.map(link => (
            axios.get(`${api_url}${link}`).then(response => {
                dispatch(receiveProject(response.data));
            })
        )))
    }
}
