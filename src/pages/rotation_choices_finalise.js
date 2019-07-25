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
import Alert from 'react-s-alert';
import update from 'immutability-helper';
import {fetchProjects} from '../actions/projects';
import {saveStudentProjects} from '../actions/users';
import {fetchUsersWithPermissions} from '../actions/users';
import {fetchRotation} from '../actions/rotations';
import {joinProjects, createProjects} from '../constants';
import ChoiceEditor from '../components/choice_editor.js';

// FIXME: there is very tight coupling between this and the ChoiceEditor
class RotationChoiceEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {choices: {}};
    }

    async componentDidMount() {
        document.title = "Student Choices";
        const series = parseInt(this.props.match.params.series, 10);
        const part = parseInt(this.props.match.params.part, 10);
        this.props.fetchProjects(series, part);
        this.props.fetchRotation(series, part);
        this.props.fetchUsersWithPermissions([joinProjects, createProjects]);
    }

    async componentDidUpdate() {
        Object.values(this.getProjects()).forEach(project => {
            const studentID = project.data.student_id;
            if (studentID !== null) {
                if (!this.state.choices.hasOwnProperty(studentID)) {
                    this.setChoice(studentID, {type: "project", id: project.data.id});
                }
            }
        });
    }

    getProjects() {
        if (this.props.rotation === undefined) {
            return {};
        }
        return Object.keys(this.props.projects).reduce((filtered, id) => {
            if (this.props.projects[id].data.group_id === this.props.rotation.data.id) {
                filtered[id] = this.props.projects[id];
            }
            return filtered;
        }, {});
    }

    setChoice(studentID, newState) {
        this.setState((state, props) => ({
            choices: update(state.choices, {$merge: {
                [studentID]: newState,
            }})
        }));
    }

    onSave(unmounted=false, cb=()=>{}) {
        this.props.saveStudentProjects(this.state.choices, () => {
            Alert.info("Saved choices.");
            if (!unmounted) {
                Object.values(this.props.projects).forEach(project => {
                    const studentID = project.data.student_id;
                    if (studentID !== null) {
                        this.setChoice(studentID, {type: "project", id: project.data.id});
                    }
                });
            }
            cb();
        });
    }

    render() {
        if (this.props.rotation === undefined) {
            return (
                <div className="container-fluid">
                    {this.props.rotationsFetching > 0 ? "Fetching rotation..." : "Could not fetch rotation."}
                </div>
            );
        }

        const students = Object.keys(this.props.users).reduce((filtered, id) => {
            if (this.props.users[id].data.permissions[joinProjects]) {
                filtered[id] = this.props.users[id];
            }
            return filtered;
        }, {});

        let studentText = this.props.fetching? `Fetching ${this.props.fetching} more users.`: "";
        if (this.props.usersFetching === 0 && Object.keys(students).length === 0) {
            studentText = "There are no students.";
        }

        const projects = this.getProjects();
        let projectText = this.props.fetching? `Fetching ${this.props.fetching} more projects.`: "";
        if (this.props.projectsFetching === 0 && Object.keys(projects).length === 0) {
            projectText = "There are no projects in this rotation.";
        }

        const rotation = this.props.rotation.data;

        return (
            <div className="container-fluid">
                {studentText}
                {projectText}
                <ChoiceEditor
                    users={this.props.users}
                    students={students}
                    projects={projects}
                    onClick={(studentID, newState) => {
                        this.setChoice(studentID, newState);
                    }}
                    choices={rotation.can_finalise ? this.state.choices : undefined}
                    showPriority={rotation.can_finalise}
                    onSubmit={() => {
                        this.onSave(true);
                        this.props.history.push(`/rotations/${rotation.series}/${rotation.part}/cogs`);
                    }}
                    onSave={(cb) => this.onSave(false, cb)}
                />
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => {
    const series = parseInt(ownProps.match.params.series, 10);
    const part = parseInt(ownProps.match.params.part, 10);
    return {
        rotationsFetching: state.rotations.fetching,
        rotation: Object.values(state.rotations.rotations).find(r => r.data.series === series && r.data.part === part),
        usersFetching: state.users.fetching,
        users: state.users.users,
        projectsFetching: state.projects.fetching,
        projects: state.projects.projects
    }
};

const mapDispatchToProps = {
    fetchProjects,
    fetchUsersWithPermissions,
    saveStudentProjects,
    fetchRotation,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RotationChoiceEditor);
