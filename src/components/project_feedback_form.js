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
import {grades} from '../constants.js';
import RichTextEditor from 'react-rte';
import {fetchUser} from '../actions/users';
import {renderDownload} from '../pages/project_download';

import './project_feedback_form.css';

// A form for submitting or viewing project feedback.
//
// Props:
// - badFeedback
// - generalFeedback
// - goodFeedback
// - onSubmit
// - project
// - readOnly
class ProjectFeedbackForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            grade: this.props.grade,
            goodFeedback: RichTextEditor.createValueFromString(this.props.goodFeedback || "", "html"),
            badFeedback: RichTextEditor.createValueFromString(this.props.badFeedback || "", "html"),
            generalFeedback: RichTextEditor.createValueFromString(this.props.generalFeedback || "", "html")
        }
    }

    // Fetch the student, supervisor, and CoGS member associated with
    // the project, if they haven't already been fetched.
    async componentDidMount() {
        const project = this.props.project;
        const studentID = project.data.student_id;
        const supervisorID = project.data.supervisor_id;
        const cogsID = project.data.cogs_marker_id;
        // TODO: this should happen in DidUpdate (what if the props change?)
        if (!this.props.users[studentID]) this.props.fetchUser(studentID);
        if (!this.props.users[supervisorID]) this.props.fetchUser(supervisorID);
        if (cogsID && !this.props.users[cogsID]) this.props.fetchUser(cogsID);
    }

    render() {
        const project = this.props.project;

        const studentAll = this.props.users[project.data.student_id];
        const supervisorAll = this.props.users[project.data.supervisor_id];
        const cogsAll = this.props.users[project.data.cogs_marker_id];

        const student = studentAll? studentAll.data: {name: "Loading"};
        const supervisor = supervisorAll? supervisorAll.data: {name: "Loading"};
        const cogsMarker = project.data.cogs_marker_id? (cogsAll? cogsAll.data: {name: "Loading"}): {name: "Nobody"};

        return (
            <div className="container">
                <div className="col-md-1"/>
                <div className="col-md-10">
                    <div className="well well-sm">
                        <div className="row">
                            <div className="col-xs-1"/>
                            <div className="col-xs-10">
                                <h3>{project.data.title}</h3>
                                <h5>Student name: {student.name}</h5>
                                <h5>Supervisor name: {supervisor.name}</h5>
                                <h5>CoGS member: {cogsMarker.name}</h5>
                                {renderDownload(project, "Download Project")}
                            </div>
                            <div className="clearfix"/>
                            <div className="col-xs-12">
                                {Object.entries(grades).map((kv) => {
                                    const [grade, description] = kv;
                                    return (
                                        <label key={grade} className="btn">
                                            <input
                                                type="radio"
                                                className="grade-radio"
                                                checked={this.state.grade === grade}
                                                onClick={this.props.readOnly ? null : () => {
                                                    this.setState({grade})
                                                }}
                                                readOnly={this.props.readOnly}
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
                                    onChange={value => {
                                        this.setState({
                                            goodFeedback: value,
                                        });
                                    }}
                                    readOnly={this.props.readOnly}
                                />
                            </div>
                            <div className="col-xs-12 form-group editor-div">
                                What improvements could the student make?
                                <RichTextEditor
                                    value={this.state.badFeedback}
                                    onChange={value => {
                                        this.setState({
                                            badFeedback: value,
                                        });
                                    }}
                                    readOnly={this.props.readOnly}
                                />
                            </div>
                            <div className="col-xs-12 form-group editor-div">
                                General comments on the project and report:
                                <RichTextEditor
                                    value={this.state.generalFeedback}
                                    onChange={value => {
                                        this.setState({
                                            generalFeedback: value,
                                        });
                                    }}
                                    readOnly={this.props.readOnly}
                                />
                            </div>
                            {!this.props.readOnly &&
                                <div className="col-xs-2">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-lg"
                                        onClick={() => {
                                            this.props.onSubmit({
                                                grade: this.state.grade,
                                                good_feedback: this.state.goodFeedback.toString("html"),
                                                bad_feedback: this.state.badFeedback.toString("html"),
                                                general_feedback: this.state.generalFeedback.toString("html"),
                                            })
                                        }}
                                    >
                                        Send Feedback
                                    </button>
                                </div>
                            }
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
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectFeedbackForm);
