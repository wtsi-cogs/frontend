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

// Page for providing feedback on a project. Accessible to supervisors
// and CoGS members.
//
// Note that this component is not used directly -- the
// ProjectMarkSupervisor and ProjectMarkCogs components defined below
// are used instead.
class ProjectMark extends Component {
    async componentDidMount() {
        document.title = "Mark Project";
        this.props.fetchProject(this.props.match.params.projectID);
    }

    // If the data in the form is all provided, submit it, otherwise
    // display an error.
    submitCheck(feedback) {
        let success = true;
        if (feedback.grade == null) {
            success = false;
            Alert.error("You must assign the report a grade");
        }
        // TODO: these feedback strings are HTML, and react-rte tends to
        // generate silly things like "<p><br><p>" for an empty input,
        // so these checks aren't sufficient unless the given input has
        // never received focus.
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
            this.props.markProject(projectID, feedback).then(() => {
                Alert.info(`Feedback for ${this.props.projects[projectID].data.title} sent.`);
                this.props.history.push("/");
            }).catch(error => (
                Alert.error(error.message)
            ));
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
                onSubmit={feedback => this.submitCheck(
                    Object.assign(
                        feedback,
                        {marker: this.props.getMarkerID(projectAll.data)},
                    )
                )}
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
        markProject: (projectID, feedback) => dispatch(markProject(projectID, feedback))
    }
};

const ConnectedProjectMark = connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectMark);

export const ProjectMarkSupervisor = props => (
    <ConnectedProjectMark
        getMarkerID={project => project.supervisor_id}
        {...props}
    />
);

export const ProjectMarkCogs = props => (
    <ConnectedProjectMark
        getMarkerID={project => project.cogs_marker_id}
        {...props}
    />
);
