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
import ProjectFeedbackForm from '../components/project_feedback_form';
import {fetchProject, markProject} from '../actions/projects';
import {fetchUser} from '../actions/users';
import './project_mark.css';

class ProjectMark extends Component {
    async componentDidMount() {
        document.title = "Mark Project";
        this.props.fetchProject(this.props.match.params.projectID);
    }

    submitCheck(feedback) {
        let success = true;
        if (feedback.grade == null) {
            success = false;
            Alert.error("You must assign the report a grade");
        }
        if (!feedback.good_feedback) {
            success = false;
            Alert.error("You must write some positive feedback on the project");
        }
        if (!feedback.general_feedback) {
            success = false;
            Alert.error("You must write some general feedback on the project");
        }
        if (!feedback.bad_feedback) {
            success = false;
            Alert.error("You must write some negative feedback on the project");
        }
        if (success) {
            const projectID = this.props.match.params.projectID;
            this.props.markProject(projectID, feedback, () => {
                Alert.info(`Feedback for ${this.props.projects[projectID].data.title} sent.`);
                this.props.history.push("/");
            });
        }
    }

    render() {
        const projectID = this.props.match.params.projectID;
        const projectAll = this.props.projects[projectID];
        if (!projectAll) {
            return "";
        }
        return (
            <ProjectFeedbackForm
                project={projectAll}
                onSubmit={feedback => {
                    this.submitCheck(feedback)
                }}
            />
        );
    }
}

const mapStateToProps = state => {
    return {
        users: state.users.users,
        projects: state.projects.projects
    }
};

const mapDispatchToProps = dispatch => {
    return {
        fetchUser: (userID) => dispatch(fetchUser(userID)),
        fetchProject: (projectID) => dispatch(fetchProject(projectID)),
        markProject: (projectID, feedback, callback) => dispatch(markProject(projectID, feedback, callback))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectMark);
