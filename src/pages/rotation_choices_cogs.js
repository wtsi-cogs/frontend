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
import { confirmAlert } from 'react-confirm-alert';
import {fetchProjects, saveCogsMarkers} from '../actions/projects';
import {unsetVotes} from '../actions/users';
import CogsEditor from '../components/cogs_edit.js';
import './rotation_choices_cogs.css';

class RotationCogsFinalise extends Component {
    constructor(props) {
        super(props);
        this.state = {
            cogsMarkers: {}
        }
    }

    async componentDidMount() {
        document.title = "Set CoGS Markers";
        const rotation = this.props.rotation;
        this.props.fetchProjects(rotation.data.series, rotation.data.part);
    }

    save(callback=()=>{}) {
        this.props.saveCogsMarkers(this.state.cogsMarkers, () => {
            Alert.info("Saved CoGS markers.");
            callback();
        });
    }

    setCogsMarker(projectID, userID) {
        this.setState(update(this.state, {
            cogsMarkers: {$merge: {[projectID]: userID}}
        }));
    }


    render() {
        const rotation = this.props.rotation;
        const projects = Object.keys(this.props.projects).reduce((filtered, id) => {
            const groupID = this.props.projects[id].data.group_id;
            if (rotation.data.id === groupID && this.props.projects[id].data.student_id !== null) {
                filtered[id] = this.props.projects[id];
            }
            return filtered;
        }, {});
        let text = this.props.fetching? `Fetching ${this.props.fetching} more projects.`: "";
        if (this.props.fetching === 0 && Object.keys(projects).length === 0) {
            text = "There are no projects in this rotation";
        }
        return (
            <div className="container-fluid">
                {text}
                <CogsEditor 
                    projects={projects}
                    cogsMarkers={this.state.cogsMarkers}
                    setCogsMarker={(projectID, userID) => this.setCogsMarker(projectID, userID)}
                />
                <div className="row padding">
                    <div className="col-xs-4 col-md-2">
                        <button className="btn btn-primary btn-lg btn-block" onClick={() => {
                            this.save();
                            this.props.history.push("/rotations/choices/finalise");
                        }}>Back</button>
                    </div>
                    <div className="col-xs-4 col-md-1"></div>
                    <div className="col-xs-4 col-md-2">
                        <button className="btn btn-primary btn-lg btn-block" onClick={() => {
                            confirmAlert({
                                title: "Finalise Student Projects",
                                message: `You are about to finalise all student choices. ` +
                                         `After this point, you will not be able to reassign projects. ` +
                                         `CoGS markers however will continue to be able to be set. ` +
                                         `Do you wish to continue?`,
                                buttons: [
                                    {label: "Yes", onClick: () => {
                                        this.save(()=> {
                                            this.props.unsetVotes(() => {
                                                Alert.info("Finalised Student choices. Emails have been sent out. Students may now upload.");
                                                this.props.history.push("/");
                                            });
                                        });
                                    }},
                                    {label: "No", onClick: () => {}},
                                ]
                            })
                        }}>Finish</button>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        rotation: state.rotations.rotations[state.rotations.latestID],
        fetching: state.projects.fetching,
        projects: state.projects.projects
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        fetchProjects: (series, part) => dispatch(fetchProjects(series, part)),
        saveCogsMarkers: (project_user_map, callback) => dispatch(saveCogsMarkers(project_user_map, callback)),
        unsetVotes: (callback) => dispatch(unsetVotes(callback)) 
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RotationCogsFinalise);