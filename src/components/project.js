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
import {connect} from 'react-redux';
import ExpandCollapse from 'react-expand-collapse';
import {Link} from 'react-router-dom';
import Alert from 'react-s-alert';
import ClassNames from 'classnames';
import {fetchUser} from '../actions/users';
import {fetchRotationFromURL} from '../actions/rotations';
import "./project.css";
import "./expand-collapse.css"


class Project extends Component {
    async componentDidMount() {
        const displayUserId = this.props.displaySupervisorName? this.props.project.data.supervisor_id: this.props.project.data.student_id;
        if (displayUserId !== null) {
            this.props.fetchUser(displayUserId);
        }
        this.props.fetchRotationFromURL(this.props.project.links.group);
    }

    renderVoteButtons() {
        const pressed = this.props.pressed;
        const onClick = buttonID => () => (
            this.props.onClick(this.props.project.data.id, buttonID).then(() => {
                Alert.info("Choice saved");
            }).catch(() => {
                Alert.error("Failed to save choice");
            })
        )
        return <div className="col-xs-2 col-md-1 button-list">
            <button type="button" className={ClassNames("btn", "btn-primary", "vote-button", {"active": pressed === 1})} data-toggle="button" aria-pressed="false" autoComplete="off" onClick={onClick(1)}>1st Choice</button>
            <button type="button" className={ClassNames("btn", "btn-primary", "vote-button", {"active": pressed === 2})} data-toggle="button" aria-pressed="false" autoComplete="off" onClick={onClick(2)}>2nd Choice</button>
            <button type="button" className={ClassNames("btn", "btn-primary", "vote-button", {"active": pressed === 3})} data-toggle="button" aria-pressed="false" autoComplete="off" onClick={onClick(3)}>3rd Choice</button>
        </div>
    }

    render() {
        const project = this.props.project.data;
        const rotation = this.props.rotations[project.group_id];
        const user = this.props.user.data;

        const displayUserId = this.props.displaySupervisorName? project.supervisor_id: project.student_id;
        let displayName = "";
        if (this.props.users[displayUserId]) {
            displayName = this.props.users[displayUserId].data.name;
        }
        let projectType = "";
        if (project.is_wetlab) {projectType += "Wetlab "}
        if (project.is_computational) {projectType += "Computational "}

        let editUrl = "";
        if ((user.id === project.supervisor_id || user.permissions.modify_permissions) && rotation) {
            editUrl = <small> <Link to={`/projects/${project.id}/edit`}>(edit)</Link></small>;
            if (rotation.data.read_only && rotation.data.id !== this.props.currentRotation) {
                editUrl = <small> <Link to={`/projects/${project.id}/resubmit`}>(edit and resubmit)</Link></small>;
            }
        }

        let links = [];
        if (user.id === project.student_id) {
            if (rotation && rotation.data.student_uploadable && !project.grace_passed) {
                links.push(<div key="upload_project"><h3><Link to={`/projects/upload`}>Upload final project report</Link></h3></div>);
            }
            if (project.cogs_feedback_id !== null) {
                links.push(<div key="cogs_feedback"><h3><Link to={`/projects/${project.id}/cogs_feedback`}>CoGS Feedback</Link></h3></div>);
            }
            if (project.supervisor_feedback_id !== null) {
                links.push(<div key="supervisor_feedback"><h3><Link to={`/projects/${project.id}/supervisor_feedback`}>Supervisor Feedback</Link></h3></div>);
            }
        }
        if (project.grace_passed) {
            if ((user.id === project.supervisor_id || user.permissions.modify_permissions)
                && project.supervisor_feedback_id == null) {
                links.push(<div key="provide_feedback_supervisor"><h3><Link to={`/projects/${project.id}/provide_feedback/supervisor`}>Provide Supervisor Feedback</Link></h3></div>);
            }
            if ((user.id === project.cogs_marker_id || user.permissions.modify_permissions)
                && project.cogs_feedback_id == null) {
                links.push(<div key="provide_feedback_cogs"><h3><Link to={`/projects/${project.id}/provide_feedback/cogs`}>Provide CoGS Feedback</Link></h3></div>);
            }
        }

        const voteButtonClassName = this.props.showVote? "col-xs-10 col-md-11": "";
        const voteButtons = this.props.showVote? this.renderVoteButtons(): "";

        return <div>
            <div className="media-body">
                <h3 className="col-sm-10 col-md-10 media-head project-title">
                    {project.title} - {displayName}
                    <small> {project.small_info}</small>
                    {editUrl}
                </h3>
                <div className="col-sm-2 col-md-2 media-middle">{projectType}</div>
            </div>
            {voteButtons}
            <div className={voteButtonClassName}>
                <div>
                    {links}
                </div>
                <ExpandCollapse
                    previewHeight="134px"
                    ellipsis={false}
                >
                    <div dangerouslySetInnerHTML={{__html: project.abstract}}/>
                </ExpandCollapse>
            </div>
        </div>;
    }
}

const mapStateToProps = state => {
    return {
        users: state.users.users,
        user: state.users.users[state.users.loggedInID],
        rotations: state.rotations.rotations,
        currentRotation: state.rotations.latestID
    }
};

const mapDispatchToProps = {
    fetchUser,
    fetchRotationFromURL,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Project);
