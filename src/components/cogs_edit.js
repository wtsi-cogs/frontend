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
import {DropdownButton, MenuItem} from 'react-bootstrap';
import {fetchUser, fetchUsersWithPermissions} from '../actions/users';
import {reviewOtherProjects} from '../constants';
import "./cogs_edit.css";


class CogsEditor extends Component {
    async componentDidMount() {
        this.props.fetchUsersWithPermissions([reviewOtherProjects]);
    }

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

    getSurname(name) {
        return name.substr(name.indexOf(" ") + 1);
    }

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

    renderBoolean(bool) {
        if (bool) {
            return <span className="glyphicon glyphicon-ok" aria-hidden="true"></span>;
        }
        return "";//<span class="glyphicon glyphicon-remove" aria-hidden="true"></span>;
    }

    renderProgrammes(project) {
        return project.programmes.map(function (programme, i) {
            return <div key={i}>{programme}</div>; 
        });
    }

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

    sortProjects(a, b) {
        const aUser = this.props.users[a[1].data.student_id];
        const bUser = this.props.users[b[1].data.student_id];
        if (!aUser || !bUser) {
            return false;
        }
        return this.getSurname(aUser.data.name) > this.getSurname(bUser.data.name);
    }
  
    renderProjects() {
        return Object.entries(this.props.projects).sort((a,b) => this.sortProjects(a,b)).map((kv) => {
            const [id, projectAll] = kv;
            const project = projectAll.data;
            return (
                <div className="row" key={id}>
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
                    <div className="col-xs-2">Project Title</div>
                    <div className="col-xs-1">Wetlab</div>
                    <div className="col-xs-1">Computational</div>
                    <div className="col-xs-1">Student</div>
                    <div className="col-xs-1">Supervisor</div>
                    <div className="col-xs-2">Others</div>
                    <div className="col-xs-2">Programmes</div>
                    <div className="col-xs-2">CoGS Member</div>
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