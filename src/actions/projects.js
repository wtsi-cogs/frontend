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
import update from '../../node_modules/immutability-helper';


export const FETCH_PROJECTS = 'FETCH_PROJECTS';
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS';
export const RECEIVE_PROJECT = 'RECEIVE_PROJECT';
export const RECEIVE_PROJECT_STATUS = 'RECEIVE_PROJECT_STATUS';
export const RECEIVE_PROJECT_MARKS = 'RECEIVE_PROJECT_MARKS';
export const DELETE_PROJECT = 'DELETE_PROJECT';

export function requestProjects(noProjects) {
    return {
        type: REQUEST_PROJECTS,
        noProjects
    }
}

export function receiveProject(project) {
    return {
        type: RECEIVE_PROJECT,
        project
    }
}

export function receiveProjectStatus(projectID, projectStatus) {
    return {
        type: RECEIVE_PROJECT_STATUS,
        projectID,
        projectStatus
    }
}

export function receiveProjectMarks(projectID, projectMarks) {
    return {
        type: RECEIVE_PROJECT_MARKS,
        projectID,
        projectMarks
    }
}

export function removeProject(projectID) {
    return {
        type: DELETE_PROJECT,
        projectID
    }
}

export function fetchProjects(series, part) {
    return function (dispatch) {
        axios.get(`${api_url}/api/series/${series}/${part}`).then(response => {
            const projects = response.data.links.projects;
            dispatch(requestProjects(projects.length));
            projects.forEach(link => {
                axios.get(`${api_url}${link}`).then(response => {
                    dispatch(receiveProject(response.data));
                });
            })
        });
    }
}

export function fetchProject(projectID) {
    return function (dispatch) {
        axios.get(`${api_url}/api/projects/${projectID}`).then(response => {
            dispatch(receiveProject(response.data));
        });
    }
}

export function fetchProjectMarks(projectID) {
    return function (dispatch) {
        axios.get(`${api_url}/api/projects/${projectID}/mark`).then(response => {
            dispatch(receiveProjectMarks(projectID, response.data.data));
        });
    }
}

export function createProject(project, onDone, onFail) {
    return function (dispatch) {
        axios.post(`${api_url}/api/projects`, project).then(response => {
            dispatch(requestProjects(1));
            dispatch(receiveProject(response.data));
            onDone();
        }).catch(onFail);
    }
}

export function editProject(projectID, project) {
    return function (dispatch) {
        axios.put(`${api_url}/api/projects/${projectID}`, project).then(response => {
            dispatch(requestProjects(1));
            dispatch(receiveProject(response.data));
        });
    }
}

export function deleteProject(projectID) {
    return function (dispatch) {
        axios.delete(`${api_url}/api/projects/${projectID}`).then(response => {
            dispatch(removeProject(projectID));
        });
    }
}

export function uploadProject(projectID, blob, callback=()=>{}) {
    return function (dispatch, getState) {
        const project = update(getState().projects.projects[projectID], {
            data: {$merge: {
                uploaded: true
            }}
        });

        const data = new FormData();
        data.append('file', blob, `${projectID}.zip`);
        axios.put(
            `${api_url}/api/projects/${projectID}/file`, 
            data,
            {
                headers: {
                    'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
                    '_axios': true
                }
            }
        ).then(response => {
            dispatch(requestProjects(1));
            dispatch(receiveProject(project));
            callback(response.data.status_message);
        }).catch(response => {
            callback(response.response.data.status_message);
        });
    }
}

export function markProject(projectID, feedback, callback) {
    return function (dispatch) {
        axios.post(`${api_url}/api/projects/${projectID}/mark`, feedback).then(response => {
            callback();
        });
    }
}

export function saveCogsMarkers(project_user_map, callback=()=>{}) {
    return function (dispatch, getState) {
        function getCogsURL(userID) {
            if (userID === null) return null;
            return `/api/users/${userID}`;
        }

        axios.put(`${api_url}/api/projects/set_cogs`, {projects: project_user_map}).then(response => {
            const state = getState();
            dispatch(requestProjects(state.projects.projects.length));
            Object.keys(state.projects.projects).forEach(projectID => {
                const project = update(state.projects.projects[projectID], {
                    links: {$merge: {cogs_marker: getCogsURL(project_user_map[projectID])}},
                    data: {$merge: {cogs_marker_id: project_user_map[projectID]}},
                });
                dispatch(receiveProject(project));
            });
            callback();
        });
    }
}

export function getProjectFileStatus(projectID) {
    return function (dispatch) {
        axios.get(`${api_url}/api/projects/${projectID}/file/status`).then(response => {
            dispatch(receiveProjectStatus(projectID, response.data));
        });
    }
}