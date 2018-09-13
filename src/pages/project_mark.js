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
import {api_url, grades} from '../config.js';
import update from 'immutability-helper';
import RichTextEditor from 'react-rte';
import Alert from 'react-s-alert';
import {fetchProject, markProject} from '../actions/projects';
import {fetchUser} from '../actions/users';
import './project_mark.css';

class ProjectFeedback extends Component {
    constructor(props) {
        super(props);
        this.state = {
            grade: null,
            goodFeedback: RichTextEditor.createValueFromString("", "html"),
            badFeedback: RichTextEditor.createValueFromString("", "html"),
            generalFeedback: RichTextEditor.createValueFromString("", "html")
        };
    }

    async componentDidMount() {
        document.title = "Mark Project";
        this.props.fetchProject(this.props.match.params.projectID);
    }

    async componentDidUpdate() {
        const projectID = this.props.match.params.projectID;
        const projectAll = this.props.projects[projectID];
        if (projectAll) {
            const project = projectAll.data;
            const studentID = project.student_id;
            const supervisorID = project.supervisor_id;
            const cogsID = project.cogs_marker_id;
            if (!this.props.users[studentID]) this.props.fetchUser(studentID);
            if (!this.props.users[supervisorID]) this.props.fetchUser(supervisorID);
            if (cogsID && !this.props.users[cogsID]) this.props.fetchUser(cogsID);
        }
    }

    submitCheck() {
        const feedback = {
            grade_id: this.state.grade,
            good_feedback: this.state.goodFeedback.toString("html"),
            bad_feedback: this.state.badFeedback.toString("html"),
            general_feedback: this.state.generalFeedback.toString("html")
        }
        let success = true;
        if (feedback.grade_id === null) {
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
        const project = projectAll.data;

        const studentAll = this.props.users[project.student_id];
        const supervisorAll = this.props.users[project.supervisor_id];
        const cogsAll = this.props.users[project.cogs_marker_id];

        const student = studentAll? studentAll.data: {name: "Loading"};
        const supervisor = supervisorAll? supervisorAll.data: {name: "Loading"};
        const cogsMarker = project.cogs_marker_id? (cogsAll? cogsAll.data: {name: "Loading"}): {name: "Nobody"};

        return (
            <div className="container">
                <div className="col-md-1"/>
                <div className="col-md-10">
                    <div className="well well-sm">
                        <div className="row">
                            <div className="col-xs-1"/>
                            <div className="col-xs-10">
                                <h3>{project.title}</h3>
                                <h5>Student name: {student.name}</h5>
                                <h5>Supervisor name: {supervisor.name}</h5>
                                <h5>CoGS member: {cogsMarker.name}</h5>
                                <a href={`${api_url}/api/projects/${projectID}/file`}>Download project</a>
                            </div>
                            <div className="clearfix"/>
                            <div className="col-xs-12">
                                {Object.entries(grades).map((kv, i) => {
                                    const [grade, description] = kv;
                                    return (
                                        <label key={grade} className="btn">
                                            <input 
                                                type="radio"
                                                className="grade-radio"
                                                checked={this.state.grade === i}
                                                readOnly={true}
                                                onClick={() => {
                                                    this.setState(update(this.state, {$merge: {grade: i}}));
                                                }}
                                            />
                                            {grade} - {description}
                                        </label>
                                    );
                                })}
                            </div>
                            <div className="col-xs-12 form-group editor-div">
                                What did the student do particularly well?
                                <RichTextEditor
                                    value={this.state.goodFeedback}
                                    onChange={(value) => {
                                        this.setState(update(this.state, {$merge: {
                                            goodFeedback: value
                                        }}));
                                    }}
                                    readOnly={false}
                                />
                            </div>
                            <div className="col-xs-12 form-group editor-div">
                                What improvements could the student make?
                                <RichTextEditor
                                    value={this.state.badFeedback}
                                    onChange={(value) => {
                                        this.setState(update(this.state, {$merge: {
                                            badFeedback: value
                                        }}));
                                    }}
                                    readOnly={false}
                                />
                            </div>
                            <div className="col-xs-12 form-group editor-div">
                                General comments on the project and report:
                                <RichTextEditor
                                    value={this.state.generalFeedback}
                                    onChange={(value) => {
                                        this.setState(update(this.state, {$merge: {
                                            generalFeedback: value
                                        }}));
                                    }}
                                    readOnly={false}
                                />
                            </div>
                            <div className="col-xs-2">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg"
                                    onClick={() => this.submitCheck()}
                                >
                                    Send Feedback
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
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
)(ProjectFeedback);