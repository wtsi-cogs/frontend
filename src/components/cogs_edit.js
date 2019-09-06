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

import React, {Component} from 'react';
import { connect } from 'react-redux';
import ClassNames from 'classnames';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import {fetchUser, fetchUsersWithPermissions} from '../actions/users';
import {reviewOtherProjects} from '../constants';
import "./cogs_edit.css";

// A table listing various details about all projects with students
// assigned, allowing the CoGS marker for those projects to be set.
//
// Props:
// - cogsMarkers
// - projects
// - setCogsMarker
class CogsEditor extends Component {
    // Ensure that all CoGS markers are in the state.
    async componentDidMount() {
        this.props.fetchUsersWithPermissions([reviewOtherProjects]);
    }

    // Ensure that all users referenced by the data in the table are in
    // the state (NB: this fetch is guarded by a check that the user has
    // not already been fetched, to ensure that we don't sit around
    // fetching the same users for eternity), and ensure that the
    // mapping of projects to CoGS markers is complete.
    async componentDidUpdate() {
        Object.entries(this.props.projects).forEach((kv) => {
            const [id, projectAll] = kv;
            const project = projectAll.data;
            // Fetch the student and supervisor
            [project.supervisor_id, project.student_id].forEach(userID => {
                if (userID && !this.props.users[userID]) {
                    this.props.fetchUser(userID);
                }
            });
            // Setup the CoGS markers if not done so already
            if (!this.props.cogsMarkers.hasOwnProperty(id)) {
                this.props.setCogsMarker(id, project.cogs_marker_id);
            }
        });
    }

    // Attempt to extract the last name/surname from a specified name.
    // See ProjectList.getLastName for critique.
    getSurname(name) {
        return name.substr(name.indexOf(" ") + 1);
    }

    // Render the dropdown button to select the CoGS marker for a
    // particular project.
    renderCogs(project) {
        return (
            <DropdownButton
                title={this.renderCogsText(this.props.cogsMarkers[project.id])}
                id={`cogs_dropdown`}
            >
                {Object.keys(this.props.users).filter(userID => this.props.users[userID].data.permissions[reviewOtherProjects]).map(userID => {
                    return (
                        <MenuItem
                            eventKey={userID}
                            key={userID}
                            disabled={parseInt(userID, 10) === project.supervisor_id}
                            onSelect={() =>
                                this.props.setCogsMarker(project.id, parseInt(userID, 10))
                            }
                        >
                            {this.renderCogsText(userID)}
                        </MenuItem>
                    );
                })}
                <MenuItem divider/>
                <MenuItem eventKey="null" onSelect={() => this.props.setCogsMarker(project.id, null)}>None</MenuItem>
            </DropdownButton>
        );
    }

    // Render the name of the specified user, or the word "None" (used
    // for the CoGS marker dropdown).
    renderCogsText(userID) {
        if (!userID) {
            return "None";
        }
        const user = this.props.users[userID];
        if (!user) {
            return "Loading user";
        }
        return user.data.name;
    }

    // Render a tick/checkmark icon if the passed argument is truthy; if
    // the argument is falsy, render nothing.
    renderBoolean(bool) {
        if (bool) {
            return <span className="glyphicon glyphicon-ok" aria-hidden="true"></span>;
        }
        return "";//<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>;
    }

    // Render the (list of) programme(s) which the given project is
    // associated with.
    renderProgrammes(project) {
        return project.programmes.map(function (programme, i) {
            return <div key={i}>{programme}</div>; 
        });
    }

    // Render the name of the specified user, or nothing (used for names
    // not in the CoGS marker dropdown).
    renderUser(userID) {
        if (!userID) {
            return null;
        }
        const user = this.props.users[userID];
        if (!user) {
            return "Loading user";
        }
        return user.data.name;
    }

    // Compare two projects, and return a number representing their sort
    // order. Intended to be used as a comparison function for
    // Array.prototype.sort.
    sortProjects(a, b) {
        const aUser = this.props.users[a[1].data.student_id];
        const bUser = this.props.users[b[1].data.student_id];
        if (!aUser || !bUser) {
            return 0;
        }
        // TODO: does this behave how users expect?
        return this.getSurname(aUser.data.name).localeCompare(this.getSurname(bUser.data.name));
    }

    // Render the contents of the table.
    renderProjects() {
        return Object.entries(this.props.projects).sort((a, b) => this.sortProjects(a, b)).map((kv, i) => {
            const [id, projectAll] = kv;
            const project = projectAll.data;
            return (
                <div className={ClassNames("row", {"shaded": i%2 === 0})} key={id}>
                    <div className="col-xs-2">{project.title}</div>
                    <div className="col-xs-1">{this.renderBoolean(project.is_wetlab)}</div>
                    <div className="col-xs-1">{this.renderBoolean(project.is_computational)}</div>
                    <div className="col-xs-1">{this.renderUser(project.student_id)}</div>
                    <div className="col-xs-1">{this.renderUser(project.supervisor_id)}</div>
                    <div className="col-xs-2">{project.small_info}</div>
                    <div className="col-xs-2">{this.renderProgrammes(project)}</div>
                    <div className="col-xs-2">{this.renderCogs(project)}</div>
                </div>
            );
        });
    }

    render() {
        if (!Object.keys(this.props.projects).length) {
            return null;
        }
        return (
            <div>
                <div className="row">
                    <div className="col-xs-2"><h5>Project Title</h5></div>
                    <div className="col-xs-1"><h5>Experimental</h5></div>
                    <div className="col-xs-1"><h5>Computational</h5></div>
                    <div className="col-xs-1"><h5>Student</h5></div>
                    <div className="col-xs-1"><h5>Supervisor</h5></div>
                    <div className="col-xs-2"><h5>Others</h5></div>
                    <div className="col-xs-2"><h5>Programmes</h5></div>
                    <div className="col-xs-2"><h5>CoGS Member</h5></div>
                </div>
                {this.renderProjects()}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        users: state.users.users
    }
};

const mapDispatchToProps = dispatch => {
    return {
        fetchUser: (userID) => dispatch(fetchUser(userID)),
        fetchUsersWithPermissions: (permissions) => dispatch(fetchUsersWithPermissions(permissions)),
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CogsEditor);
