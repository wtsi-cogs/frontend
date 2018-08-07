import axios from 'axios';
import api_url from '../config.js';


export const FETCH_PROJECTS = 'FETCH_PROJECTS';
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS';
export const RECEIVE_PROJECT = 'RECEIVE_PROJECT';

function requestProjects(noProjects) {
    return {
        type: REQUEST_PROJECTS,
        noProjects
    }
}

function receiveProject(project) {
    return {
        type: RECEIVE_PROJECT,
        project
    }
}

export default function fetchProjects(series, part) {
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