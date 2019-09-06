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

export const REQUEST_EMAILS = 'REQUEST_EMAILS';
export const RECIEVE_EMAIL = 'RECIEVE_EMAIL';

// Increase (not increment!) the number of email templates currently
// being fetched.
function requestEmails(noEmails) {
    return {
        type: REQUEST_EMAILS,
        noEmails
    }
}

// Decrement the number of email templates currently being fetched, and
// update the state with the received template.
function receiveEmail(email) {
    return {
        type: RECIEVE_EMAIL,
        email
    }
}

// Fetch all email templates from the backend.
export function fetchEmails() {
    return function (dispatch) {
        return axios.get(`${api_url}/api/emails`).then(response => {
            const emailList = response.data;
            dispatch(requestEmails(emailList.items.length));
            emailList.items.forEach(email => {
                const emailData = update(email, {$merge: {link: emailList.links[email.name]}});
                dispatch(receiveEmail(emailData));
            });
        });
    }
}

// Set an email template (subject and contents).
export function setEmail(emailID, subject, content) {
    return function (dispatch, getState) {
        const state = getState();
        const email = state.emails.emails[emailID];
        return axios.put(
            `${api_url}/api/emails/${email.name}`,
            {subject, content},
            {
                headers: {
                    // Disable the fallback error handler.
                    '_axios': true
                }
            }
        ).then(response => {
            const updatedEmail = update(email,
                {$merge: {subject, content}}
            );
            dispatch(requestEmails(1));
            dispatch(receiveEmail(updatedEmail));
        }).catch(error => {
            // Extract the error message from the response.
            throw new Error(error.response.data.status_message);
        });
    }
}
