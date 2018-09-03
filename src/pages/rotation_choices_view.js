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
import {fetchProjects} from '../actions/projects';
import {fetchUsersWithPermissions} from '../actions/users';
import {joinProjects, createProjects} from '../config';
import ChoiceEditor from '../components/choice_editor.js';

class RotationChoiceViewer extends Component {
    async componentDidMount() {
        document.title = "View Student Choices";
        const rotation = this.props.rotation;
        this.props.fetchProjects(rotation.data.series, rotation.data.part);
        this.props.fetchUsersWithPermissions([joinProjects, createProjects]);
    }

    render() {
        const users = Object.keys(this.props.users).reduce((filtered, id) => {
            if (this.props.users[id].data.permissions[joinProjects]) {
                filtered[id] = this.props.users[id];
            }
            return filtered;
        }, {});

        let studentText = this.props.fetching? `Fetching ${this.props.fetching} more users.`: "";
        if (this.props.usersFetching === 0 && Object.keys(users).length === 0) {
            studentText = "There are no students.";
        }


        const projects = Object.keys(this.props.projects).reduce((filtered, id) => {
            if (this.props.projects[id].data.group_id === this.props.rotation.data.id) {
                filtered[id] = this.props.projects[id];
            }
            return filtered;
        }, {});
        let projectText = this.props.fetching? `Fetching ${this.props.fetching} more projects.`: "";
        if (this.props.projectsFetching === 0 && Object.keys(projects).length === 0) {
            projectText = "There are no projects in this rotation.";
        }

        return (
            <div className="container-fluid">
                {studentText}
                {projectText}
                <ChoiceEditor
                    users={users}
                    projects={projects}
                    showOverride={false}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        rotation: state.rotations.rotations[state.rotations.latestID],
        usersFetching: state.users.fetching,
        users: state.users.users,
        projectsFetching: state.projects.fetching,
        projects: state.projects.projects
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        fetchProjects: (series, part) => dispatch(fetchProjects(series, part)),
        fetchUsersWithPermissions: (permissions) => dispatch(fetchUsersWithPermissions(permissions))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RotationChoiceViewer);