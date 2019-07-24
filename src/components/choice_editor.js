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
import {createProjects} from '../constants';
import "./choice_editor.css";

class ChoiceEditor extends Component {
    getProjectTitle(projectID) {
        const project = this.props.projects[projectID];
        if (!project) {
            return "";
        }
        return project.data.title;
    }

    getUserChoices(user) {
        return [
            user.first_option_id,
            user.second_option_id,
            user.third_option_id
        ];
    }

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

    onSelect(studentID, type, id) {
        this.props.onClick(studentID, {type, id: parseInt(id, 10)});
    }


    invalidChoices() {
        return Object.keys(this.props.students).filter(userID => {
            const userOption = this.props.choices[userID];
            if (!userOption) {
                return false;
            }
            if (userOption.type === "user") {
                return false;
            }
            return Object.keys(this.props.students).some(otherUserID => {
                if (otherUserID === userID) {
                    return false;
                }
                const otherUserOption = this.props.choices[otherUserID];
                if (!otherUserOption) {
                    return false;
                }
                if (otherUserOption.type === "user") {
                    return false;
                }
                return userOption.id === otherUserOption.id;
            });
        });
    }

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
                        onClick={() => this.props.onSubmit()}
                        disabled={submitDisabled}
                    >
                        Assign CoGS Markers
                    </button>
                </div>
            </div>
        );
    }

    renderDropdowns(userID) {
        const projects = this.props.projects;
        const selected = this.getSelectedCheckBox(userID);
        return (
            <div>
                <div className="one-line">
                    <input type="checkbox" checked={selected === 3} readOnly={true}/>
                    <DropdownButton
                        title={selected === 3 && projects.hasOwnProperty(this.props.choices[userID].id)? this.props.projects[this.props.choices[userID].id].data.title: "Other Project"}
                        id={`project_dropdown_${userID}`}
                    >
                        {Object.keys(this.props.projects).filter(projectID => !this.getUserChoices(this.props.students[userID].data).includes(parseInt(projectID, 10))).map(projectID => {
                            return (
                                <MenuItem
                                    eventKey={projectID}
                                    key={projectID}
                                    onSelect={() => {this.onSelect(userID, "project", projectID)}}
                                >
                                    {projects[projectID].data.title}
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

    renderStudentChoices(invalidUsers) {
        const showButtons = Boolean(this.props.choices);
        return Object.entries(this.props.students).sort((a,b) => a[1].data.priority < b[1].data.priority).map((kv) => {
            const [id, userAll] = kv;
            const user = userAll.data;
            const projectIDs = this.getUserChoices(user);

            return (
                <div className={`row striped${invalidUsers.includes(id)? " invalid": ""}`} key={id}>
                    <div className="col-xs-3">{user.name}</div>
                    {this.props.showPriority && (
                        <div className="col-xs-1">{user.priority}</div>
                    )}
                    <div className="col-xs-8">
                        <ol>
                            {projectIDs.map((projectID, i) => {
                                const title = this.getProjectTitle(projectID) || "(No choice)";
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
                </div>
            );
        });
    }

    render() {
        const showButtons = Boolean(this.props.choices);
        const invalidUsers = showButtons? this.invalidChoices(): [];
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
                    invalidUsers.length || Object.keys(this.props.choices).length < Object.keys(this.props.students).length,
                    Boolean(invalidUsers.length)
                )}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        fetching: state.users.fetching

    }
};  

const mapDispatchToProps = dispatch => {
    return {
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChoiceEditor);
