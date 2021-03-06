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

import React, {Component, Fragment} from 'react';
import { connect } from 'react-redux';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import ClassNames from 'classnames';
import Alert from 'react-s-alert';
import {confirmAlert} from 'react-confirm-alert';
import {unsetVotes} from '../actions/users';
import {createProjects} from '../constants';
import "./choice_editor.css";

// A table listing students, their priorities, their project choices,
// and their assigned project (if they have been assigned one).
//
// Props:
// - choices
// - onClick
// - onSave
// - onSubmit
// - projects
// - rotationID
// - showPriority
// - students
// - users
//
// FIXME: there is very tight coupling between this and the RotationChoiceEditor
class ChoiceEditor extends Component {
    // Get the title, supervisor, and experimental/computational status
    // of a project.
    getProjectTitle(projectID) {
        const project = this.props.projects[projectID];
        if (project == null) {
            return this.props.projectsFetching > 0 ? "Loading project..." : "Unknown project";
        }
        const title = project.data.title;
        const supervisor_id = project.data.supervisor_id;
        const supervisor = this.props.users[supervisor_id];
        const supervisor_name = supervisor != null ? supervisor.data.name : this.props.usersFetching > 0 ? "Loading supervisor..." : "Unknown supervisor";
        const wetlab_computational = [
            ...(project.data.is_wetlab ? ["experimental"] : []),
            ...(project.data.is_computational ? ["computational"] : []),
        ].join(" and ") || "project type not entered";
        return `${title} –  ${supervisor_name} (${wetlab_computational})`
    }

    // Return a list of the project IDs of a student's choices.
    getUserChoices(user) {
        return [
            user.first_option_id,
            user.second_option_id,
            user.third_option_id
        ];
    }

    // Determine which checkbox should be selected for a student (one of
    // their three choices, a different project, or a supervisor).
    getSelectedCheckBox(userID) {
        const userOption = this.props.choices[userID];
        if (!userOption) {
            return null;
        }
        if (userOption.type === "project") {
            const userChoices = this.getUserChoices(this.props.students[userID].data);
            const index = userChoices.indexOf(userOption.id);
            if (index === -1) {
                return 3
            }
            return index;
        }
        else if (userOption.type === "user") {
            return 4;
        }
    }

    // Handle assignment of a project or supervisor (specified by `id`)
    // for a student. `type` is either "project" or "user".
    onSelect(studentID, type, id) {
        this.props.onClick(studentID, {type, id: parseInt(id, 10)});
    }

    // Produces an object mapping user IDs to lists of conflicting
    // users. If a user's choice does not conflict, it will not be
    // present in the keys of the returned object.
    invalidChoices() {
        return Object.keys(this.props.students).reduce((obj, userID) => {
            const userOption = this.props.choices[userID];
            if (!userOption) {
                return obj;
            }
            if (userOption.type === "user") {
                return obj;
            }
            const conflictingUsers = Object.keys(this.props.students).map(otherUserID => {
                if (otherUserID === userID) {
                    return null;
                }
                const otherUserOption = this.props.choices[otherUserID];
                if (!otherUserOption) {
                    return null;
                }
                if (otherUserOption.type === "user") {
                    return null;
                }
                if (userOption.id !== otherUserOption.id) {
                    return null;
                }
                return otherUserID;
            }).filter(x => x != null);
            if (conflictingUsers.length) {
                obj[userID] = conflictingUsers;
            }
            return obj;
        }, {});
    }

    // Render the save/finalise buttons at the bottom of the page.
    renderSaveButtons(submitDisabled, saveDisabled) {
        return (
            <div className="row">
                <div className="col-sm-4 spacing">
                    <button
                        className="btn btn-primary btn-lg btn-block"
                        onClick={() => this.props.onSave()}
                        disabled={saveDisabled}
                    >
                        Save
                    </button>
                </div>
                <div className="col-sm-4"></div>
                <div className="col-sm-4 spacing">
                    <button
                        className="btn btn-primary btn-lg btn-block"
                        disabled={submitDisabled}
                        onClick={() => {
                            confirmAlert({
                                title: "Finalise Student Projects",
                                message: "You are about to finalise all student choices. " +
                                "After this point, you will not be able to reassign projects. " +
                                "CoGS markers however will continue to be able to be set. " +
                                "Do you wish to continue?",
                                buttons: [
                                    {label: "Yes", onClick: () => {
                                        return this.props.onSave().then(() => {
                                            return this.props.unsetVotes(this.props.rotationID).then(() => {
                                                Alert.info("Finalised Student choices. Emails have been sent out. Students may now upload.");
                                                this.props.onSubmit();
                                            });
                                        });
                                    }},
                                    {label: "No", onClick: () => {}},
                                ],
                            })
                        }}
                    >Finalise Projects</button>
                </div>
            </div>
        );
    }

    // Render the dropdowns for a particular user.
    renderDropdowns(userID) {
        const projects = this.props.projects;
        const selected = this.getSelectedCheckBox(userID);
        return (
            <div>
                <div className="one-line btn-long">
                    <input type="checkbox" checked={selected === 3} readOnly={true}/>
                    <DropdownButton
                        title={selected === 3 && projects.hasOwnProperty(this.props.choices[userID].id) ? this.getProjectTitle(this.props.choices[userID].id) : "Other Project"}
                        id={`project_dropdown_${userID}`}
                    >
                        {Object.keys(this.props.projects).filter(projectID => !this.getUserChoices(this.props.students[userID].data).includes(parseInt(projectID, 10))).map(projectID => {
                            return (
                                <MenuItem
                                    eventKey={projectID}
                                    key={projectID}
                                    onSelect={() => {this.onSelect(userID, "project", projectID)}}
                                >
                                    {this.getProjectTitle(projectID)}
                                </MenuItem>
                            );
                        })}
                    </DropdownButton>
                </div>
                <div className="one-line">
                    <input type="checkbox" checked={selected === 4} readOnly={true}/>
                    <DropdownButton
                        title={selected === 4? this.props.users[this.props.choices[userID].id].data.name: "Other Supervisor"}
                        id={`supervisor_dropdown_${userID}`}
                    >
                        {Object.keys(this.props.users).filter(supervisorID => this.props.users[supervisorID].data.permissions[createProjects]).map(supervisorID => {
                            const user = this.props.users[supervisorID].data;
                            return (
                                <MenuItem 
                                    eventKey={supervisorID}
                                    key={supervisorID}
                                    onSelect={() => {this.onSelect(userID, "user", supervisorID)}}
                                >
                                    {user.name}
                                </MenuItem>
                            );
                        })}
                    </DropdownButton>
                </div>
            </div>
        );
    }

    // Render the contents of the table, for all users.
    renderStudentChoices(invalidUsers) {
        const showButtons = Boolean(this.props.choices);
        // Sort descending by priority.
        return Object.entries(this.props.students).sort((a, b) => b[1].data.priority - a[1].data.priority).map((kv) => {
            const [id, userAll] = kv;
            const user = userAll.data;
            const projectIDs = this.getUserChoices(user);
            const conflicts = invalidUsers[id] || [];

            return (
                <div className={ClassNames("row", "striped", {"invalid": conflicts.length})} key={id}>
                    <div className="col-xs-3 col-lg-2">{user.name}</div>
                    {this.props.showPriority && (
                        <div className="col-xs-1">{user.priority}</div>
                    )}
                    <div className="col-xs-5 col-lg-6">
                        <ol>
                            {projectIDs.map((projectID, i) => {
                                const title = projectID != null ? this.getProjectTitle(projectID) : "(No choice)";
                                if (showButtons) {
                                    return (
                                        <li key={i}>
                                            <input
                                                type="checkbox"
                                                id={`checkbox_${id}_${projectID}`}
                                                checked={this.getSelectedCheckBox(id) === i}
                                                readOnly={true}
                                                disabled={!this.props.projects[projectID]}
                                                onClick={() => {this.onSelect(id, "project", projectID)}}
                                            />
                                            <label htmlFor={`checkbox_${id}_${projectID}`}>
                                                {title}
                                            </label>
                                        </li>
                                    );
                                } else {
                                    return <li key={i}>{title}</li>
                                }
                            })}
                        </ol>
                       {showButtons && this.renderDropdowns(id)}
                    </div>
                    <div className="col-xs-3">
                        {
                            conflicts.length ?
                                <Fragment>Choice conflicts with {conflicts.map(uid =>
                                    this.props.users[uid].data.name
                                ).join(", ")}</Fragment>
                                : null
                        }
                    </div>
                </div>
            );
        });
    }

    render() {
        const showButtons = Boolean(this.props.choices);
        const invalidUsers = showButtons? this.invalidChoices(): {};
        return (
            <div className="container">
                <div className="row">
                    <div className="col-xs-3">Student</div>
                    {this.props.showPriority && (
                        <div className="col-xs-1">Priority</div>
                    )}
                    <div className="col-xs-8">Choices</div>
                </div>
                {this.renderStudentChoices(invalidUsers)}

                {showButtons && this.renderSaveButtons(
                    Object.keys(invalidUsers).length || Object.keys(this.props.choices).length < Object.keys(this.props.students).length,
                    Boolean(Object.keys(invalidUsers).length)
                )}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        usersFetching: state.users.fetching,
        projectsFetching: state.projects.fetching,
    }
};

const mapDispatchToProps = {
    unsetVotes,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChoiceEditor);
