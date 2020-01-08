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
import update from 'immutability-helper';
import Alert from 'react-s-alert';
import {fetchProjects, saveCogsMarkers} from '../actions/projects';
import {fetchRotation} from '../actions/rotations';
import CogsEditor from '../components/cogs_edit.js';

// Page for assigning CoGS members to projects. Only projects from this
// rotation with students assigned are displayed.
class RotationCogsEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cogsMarkers: {}
        }
    }

    async componentDidMount() {
        document.title = "Edit CoGS Markers";
        const series = parseInt(this.props.match.params.series, 10);
        const part = parseInt(this.props.match.params.part, 10);
        this.fetchRotation(series, part);
    }

    componentDidUpdate() {
        const series = parseInt(this.props.match.params.series, 10);
        const part = parseInt(this.props.match.params.part, 10);
        if (series !== this.state.series || part !== this.state.part) {
            this.fetchRotation(series, part);
        }
    }

    // Switch to displaying the given rotation, and fetch the necessary
    // data to do so.
    fetchRotation(series, part) {
        this.setState({series, part});
        this.props.fetchProjects(series, part);
        this.props.fetchRotation(series, part);
    }

    // Submit the currently-selected markers to the server.
    save() {
        this.props.saveCogsMarkers(this.state.cogsMarkers).then(() => {
            Alert.info("Saved CoGS markers.");
        });
    }

    // Select a CoGS member to mark a project.
    setCogsMarker(projectID, userID) {
        this.setState((state, props) => update(state, {
            cogsMarkers: {$merge: {[projectID]: userID}}
        }));
    }

    render() {
        const series = this.state.series;
        const part = this.state.part;
        const rotation = Object.values(this.props.rotations).find(r => r.data.series === series && r.data.part === part);
        if (!rotation) {
            return null;
        }
        const projects = Object.keys(this.props.projects).reduce((filtered, id) => {
            const groupID = this.props.projects[id].data.group_id;
            const currentRotation = this.props.rotations[groupID].data;
            if (currentRotation.series === series && currentRotation.part === part && this.props.projects[id].data.student_id !== null) {
                filtered[id] = this.props.projects[id];
            }
            return filtered;
        }, {});
        let text = this.props.fetching? `Fetching ${this.props.fetching} more projects.`: "";
        if (this.props.fetching === 0 && Object.keys(projects).length === 0) {
            text = "There are no projects with students assigned in this rotation.";
        }
        return (
            <div className="container-fluid">
                {text}
                <CogsEditor 
                    projects={projects}
                    cogsMarkers={this.state.cogsMarkers}
                    setCogsMarker={(projectID, userID) => this.setCogsMarker(projectID, userID)}
                />
                <div className="row">
                    <div className="col-xs-6 col-sm-4 spacing">
                        <button className="btn btn-primary btn-lg btn-block" onClick={() => this.save()}>Save Changes</button>
                    </div>
                    <div className="col-sm-4"></div>
                    <div className="col-xs-6 col-sm-4 spacing">
                        {rotation.data.can_finalise &&
                            <button
                                className="btn btn-primary btn-lg btn-block"
                                onClick={() => this.save(() => {
                                    this.props.history.push(`/rotations/${series}/${part}/choices`);
                                })}
                            >
                                Return to Assign Projects
                            </button>
                        }
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        rotations: state.rotations.rotations,
        fetching: state.projects.fetching,
        projects: state.projects.projects,
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        fetchProjects: (series, part) => dispatch(fetchProjects(series, part)),
        fetchRotation: (series, part) => dispatch(fetchRotation(series, part)),
        saveCogsMarkers: (project_user_map) => dispatch(saveCogsMarkers(project_user_map))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RotationCogsEditor);
