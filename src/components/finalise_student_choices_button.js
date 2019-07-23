/*
Copyright (c) 2019 Genome Research Ltd.

Authors:
* Josh Holland <jh36@sanger.ac.uk>

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


import React, {Component} from 'react';
import {connect} from 'react-redux';
import Alert from 'react-s-alert';
import {confirmAlert} from 'react-confirm-alert';
import {unsetVotes} from '../actions/users';

class FinaliseStudentProjectsButton extends Component {
    static defaultProps = {
        preClick: (cb) => {cb()},
    };

    render() {
        return (
            <button className="btn btn-primary btn-lg btn-block" onClick={() => {
                confirmAlert({
                    title: "Finalise Student Projects",
                    message: "You are about to finalise all student choices. " +
                             "After this point, you will not be able to reassign projects. " +
                             "CoGS markers however will continue to be able to be set. " +
                             "Do you wish to continue?",
                    buttons: [
                        {label: "Yes", onClick: () => {
                            this.props.preClick(() => {
                                this.props.unsetVotes(() => {
                                    Alert.info("Finalised Student choices. Emails have been sent out. Students may now upload.");
                                });
                            });
                        }},
                        {label: "No", onClick: () => {}},
                    ],
                })
            }}>Finish</button>
        );
    }
}

const mapDispatchToProps = {
    unsetVotes,
}

export default connect(
    null,
    mapDispatchToProps,
)(FinaliseStudentProjectsButton);
