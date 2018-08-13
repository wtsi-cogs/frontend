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
import {fetchUser} from '../actions/users';
import {fetchRotationFromURL} from '../actions/rotations';
import "./project.css";


class Project extends Component {
    async componentDidMount() {
        const displayUserId = this.props.displaySupervisorName? this.props.project.data.supervisor_id: this.props.project.data.student_id;
        this.props.fetchUser(displayUserId);
        this.props.fetchRotationFromURL(this.props.project.links.group);
    }

    renderVoteButtons() {
        const pressed = 1;
        return <div className="col-sm-2 col-md-1 button-list">
            <button type="button" className={`btn btn-primary vote-button ${pressed === 1 && "active"}`} data-toggle="button" aria-pressed="false" autoComplete="off">1st Choice</button>
            <button type="button" className={`btn btn-primary vote-button ${pressed === 2 && "active"}`} data-toggle="button" aria-pressed="false" autoComplete="off">2nd Choice</button>
            <button type="button" className={`btn btn-primary vote-button ${pressed === 3 && "active"}`} data-toggle="button" aria-pressed="false" autoComplete="off">3rd Choice</button>
    </div>
    }

    render() {
        const project = this.props.project.data;
        const rotation = this.props.rotations[project.group_id];

        const displayUserId = this.props.displaySupervisorName? project.supervisor_id: project.student_id;
        let displayName = "";
        if (this.props.users[displayUserId]) {
            displayName = this.props.users[displayUserId].data.name;
        }
        let projectType = "";
        if (project.is_wetlab) {projectType += "Wetlab "}
        if (project.is_computational) {projectType += "Computational "}

        let editUrl = "";
        if (this.props.loggedInUserID === project.supervisor_id && rotation) {
            if (!rotation.data.read_only) {
                editUrl = <small> <a href={`/projects/${project.id}/edit`}>(edit)</a></small>;
            }
            else if (rotation.data.id !== this.props.currentRotation) {
                editUrl = <small> <a href={`/projects/${project.id}/resubmit`}>(edit and resubmit)</a></small>;
            }
        }

        let links = [];
        if (this.props.loggedInUserID === project.student_id && rotation) {
            if (rotation.student_uploadable && !project.grace_passed) {
                links.push(<div key="upload_project"><h3><a href={`/projects/${project.id}/`}>Upload final project report</a></h3><br/></div>);
            }
            if (project.supervisor_feedback_id !== null) {
                links.push(<div key="supervisor_feedback"><h3><a href={`/projects/${project.id}/supervisor_feedback`}>Supervisor Feedback</a></h3><br/></div>);
            }
            if (project.cogs_feedback_id !== null) {
                links.push(<div key="cogs_feedback"><h3><a href={`/projects/${project.id}/cogs_feedback`}>CoGS Feedback</a></h3><br/></div>);
            }
        }
        if (project.grace_passed) {
            if ((this.props.loggedInUserID === project.supervisor_id && project.supervisor_feedback_id !== null) ||
                (this.props.loggedInUserID === project.cogs_marker_id && project.cogs_feedback_id !== null)) {
                    links.push(<div key="provide_feedback"><h3><a href={`/projects/${project.id}/provide_feedback`}>Provide Feedback</a></h3><br/></div>);
            }
        }

        let voteButtonClassName = "col-sm-10 col-md-11";
        let voteButtons = this.renderVoteButtons();

        return <div>
            <div className="media-body">
                <h2 className="col-sm-10 col-md-10 media-head project-title">
                    {project.title} - {displayName} 
                    <small> {project.small_info}</small>
                    {editUrl}
                </h2>
                <div className="col-sm-2 col-md-2 media-middle">{projectType}</div>
            </div>
            {voteButtons}
            <div className={voteButtonClassName}>
                <div>
                    {links}
                </div>
                <div dangerouslySetInnerHTML={{__html: project.abstract}}/>
            </div>
        </div>;
    }
}

const mapStateToProps = state => {
    return {
        users: state.users.users,
        loggedInUserID: state.users.loggedInID,
        rotations: state.rotations.rotations,
        currentRotation: state.rotations.latestID
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        fetchUser: (userID) => dispatch(fetchUser(userID)),
        fetchRotationFromURL: (url) => dispatch(fetchRotationFromURL(url))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Project);