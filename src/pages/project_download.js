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
import {fetchProject, downloadProject, getSeriesPart} from '../actions/projects';
import {Link} from 'react-router-dom';
import Alert from 'react-s-alert';

// Page which automatically downloads a project.
//
// TODO: this isn't currently linked to from anywhere.
class ProjectDownload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: "Fetching project title...",
            startedDownload: false
        };
        props.fetchProject(props.match.params.projectID);
    }

    async componentDidMount() {
        document.title = "Download Project";
    }

    setMessage(message) {
        if (message !== this.state.message) {
            this.setState({message});
        }
    }

    async componentDidUpdate() {
        const project = this.props.projects[this.props.match.params.projectID];
        if (!project) this.setMessage("Fetching project...");
        else if (!this.state.started) {
            
            downloadProject(project).then(status => {
                    this.setMessage(status);
                });

            this.setState({
                message: "Starting download...",
                started: true
            });
        }
    }

    render() {
        const project = this.props.projects[this.props.match.params.projectID];
        const rotation_parts = project? getSeriesPart(project): null;
        return (
            <div className="container">
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <div className="well well-sm">
                        <div className="row">
                            <div className="col-md-2"></div>
                            <div className="col-md-8">
                                <h1>{this.state.message}</h1>
                                {project && <h4>Rotation: {rotation_parts[0]} - {rotation_parts[1]}</h4>}
                                {project && <h4>Project: {project.data.title}</h4>}
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
        projects: state.projects.projects,
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        fetchProject: projectID => dispatch(fetchProject(projectID)),
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectDownload);

export function renderDownload(project, label) {
    return (
        <Link to="#" onClick={() => {
            downloadProject(project).then(msg  => (
                Alert.success(msg)
            )).catch(error => (
                Alert.error(error.message)
            ));
        }}>
            {label}
        </Link>
    );
}
