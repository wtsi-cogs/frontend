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


export const FETCH_ROTATIONS = 'FETCH_ROTATIONS';
export const REQUEST_ROTATIONS = 'REQUEST_ROTATIONS';
export const RECEIVE_ROTATION = 'RECEIVE_ROTATION';

export const FETCH_LATEST_ROTATION = 'FETCH_LATEST_ROTATION';
export const REQUEST_LATEST_ROTATION = 'REQUEST_LATEST_ROTATION';
export const RECEIVE_LATEST_ROTATION = 'RECEIVE_LATEST_ROTATION';

function requestRotations(noRotations) {
    return {
        type: REQUEST_ROTATIONS,
        noRotations
    }
}

function receiveRotation(rotation) {
    return {
        type: RECEIVE_ROTATION,
        rotation
    }
}

function requestLatestRotation() {
    return {
        type: REQUEST_LATEST_ROTATION,
    }
}

function receiveLatestRotation(rotationID) {
    return {
        type: RECEIVE_LATEST_ROTATION,
        rotationID
    }
}

export function fetchLatestSeries() {
    return function (dispatch) {
        axios.get(`${api_url}/api/series`).then(response => {
            const yearData = response.data;
            const latestSeries = Math.max(...Object.keys(yearData.links));
            axios.get(`${api_url}/api/series/${latestSeries}`).then(response => {
                const seriesParts = Object.keys(response.data.links);
                const latestPart = Math.max(...seriesParts);
                dispatch(requestRotations(seriesParts.length));
                seriesParts.forEach(part => {
                    axios.get(`${api_url}/api/series/${latestSeries}/${part}`).then(response => {
                        const rotation = response.data;
                        dispatch(receiveRotation(rotation));
                        if (rotation.data.part === latestPart) {
                            dispatch(receiveLatestRotation(rotation.data.id));
                        }
                    });
                });
            });
        });
    }
}

export function fetchLatestRotation() {
    return function (dispatch) {
        dispatch(requestRotations(1));
        dispatch(requestLatestRotation());
        axios.get(`${api_url}/api/series/latest`).then(response => {
            const rotation = response.data;
            dispatch(receiveRotation(rotation));
            dispatch(receiveLatestRotation(rotation.data.id));
        });
    }
}

export function saveRotation(rotation) {
    return function (dispatch, getState) {
        const state = getState();
        const stateRotation = state.rotations.rotations[rotation.id];
        const updatedState = update(stateRotation, {
            data: {deadlines: deadlines => Object.keys(deadlines).reduce((prev, name) => {
                prev[name] = update(deadlines[name], {$merge: {value: rotation.deadlines[name]}});
                return prev;
            }, {})}
        });
        axios.put(`${api_url}/api/series/${updatedState.data.series}/${updatedState.data.part}`, rotation["deadlines"]).then(response => {
            dispatch(receiveRotation(updatedState));
        });
    }
}