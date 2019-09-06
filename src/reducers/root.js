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

import { combineReducers } from 'redux'
import update from 'immutability-helper';

import {REQUEST_PROJECTS, RECEIVE_PROJECT, RECEIVE_PROJECT_STATUS, RECEIVE_PROJECT_MARKS, DELETE_PROJECT} from '../actions/projects';
import {REQUEST_EMAILS, RECIEVE_EMAIL} from '../actions/emails';
import { REQUEST_USERS, RECEIVE_USER, RECEIVE_ME } from '../actions/users';
import { REQUEST_ROTATIONS, RECEIVE_ROTATION, RECEIVE_LATEST_ROTATION, RECEIVE_ROTATION_YEARS } from '../actions/rotations';

// Most of the functions here are relatively self-explanatory, so
// there's little point commenting them individually. The actions are
// defined in files in src/actions, so there are some comments there
// explaining what each action is meant to do; each of the functions
// here is a reducer that takes the current state and an action, and
// returns a new state that is somehow altered as a result of the
// action.
//
// If you're confused by this, read the Redux documentation:
// <https://redux.js.org/> (this app also uses React Redux, which is all
// the connect() gubbins, but that's not relevant in this file).

function projects(state={
    fetching: 0,
    projects: {},
    projectStatus: {},
    projectMarks: {}
}, action) {
    switch (action.type) {
        case REQUEST_PROJECTS:
            return update(state, {
                fetching: {$set: state.fetching + action.noProjects}
            });
       case RECEIVE_PROJECT:
            return update(state, {
                fetching: {$set: state.fetching-1},
                projects: {$merge: {[action.project.data.id]: action.project}}
            }); 
        case DELETE_PROJECT:
            return update(state, {
                projects: {$unset: [action.projectID]}
            }); 
        case RECEIVE_PROJECT_STATUS: 
            return update(state, {
                projectStatus: {$merge: {[action.projectID]: action.projectStatus}}
            }); 
        case RECEIVE_PROJECT_MARKS: 
            return update(state, {
                projectMarks: {$merge: {[action.projectID]: action.projectMarks}}
            }); 
        default:
            return state;
    }
}

function users(state={
    fetching: 0,
    users: {},
    loggedInID: null
}, action) {
    switch (action.type) {
        case REQUEST_USERS:
            return update(state, {
                fetching: {$set: state.fetching + action.noUsers}
            });
       case RECEIVE_USER:
            return update(state, {
                fetching: {$set: state.fetching-1},
                users: {$merge: {[action.user.data.id]: action.user}}
            }); 
        case RECEIVE_ME:
            return update(state, {
                loggedInID: {$set: action.userID}
            });
        default:
            return state;
    }
}

function rotations(state={
    fetching: 0,
    rotations: {},
    yearList: [],
    latestID: null
}, action) {
    switch (action.type) {
        case REQUEST_ROTATIONS:
            return update(state, {
                fetching: {$set: state.fetching + action.noRotations}
            });
       case RECEIVE_ROTATION:
            return update(state, {
                fetching: {$set: state.fetching-1},
                rotations: {$merge: {[action.rotation.data.id]: action.rotation}}
            }); 
        case RECEIVE_LATEST_ROTATION:
            return update(state, {
                latestID: {$set: action.rotationID}
            });
        case RECEIVE_ROTATION_YEARS:
            return update(state, {
                yearList: {$set: action.rotationYears}
            });
        default:
            return state;
    }
}

function emails(state={
    fetching: 0,
    emails: {}
}, action) {
    switch (action.type) {
        case REQUEST_EMAILS:
            return update(state, {
                fetching: {$set: state.fetching + action.noEmails}
            });
       case RECIEVE_EMAIL:
            return update(state, {
                fetching: {$set: state.fetching-1},
                emails: {$merge: {[action.email.id]: action.email}}
            });
        default:
            return state;
    }
}

// When an action is received, send it to all reducers (in this
// application, all but one will ignore it), and combine the new states
// they return into one state indexed by the name of the reducer.
//
// In other words: the structure of the reducers mirrors the structure
// of the data.
const rootReducer = combineReducers({
  projects,
  users,
  rotations,
  emails,
});

export default rootReducer
