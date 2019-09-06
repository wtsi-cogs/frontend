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
import {fetchProjects} from '../actions/projects';
import {getStudentProjects, sendReceipt} from '../actions/users'
import {fetchAllRotations} from '../actions/rotations';
import ProjectList from '../components/project_list.js';
import {programmes} from '../constants';
import Select from 'react-select';
import MultiselectDropDown from '../components/multiselect_dropdown';
import update from 'immutability-helper';
import './projects.css';

// A page listing all projects in a rotation. Members of staff
// (supervisors, CoGS members, Graduate Office) -- but not students --
// can select which rotation they are viewing the projects for.
class Projects extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showWetlab: true,
            showComputational: true,
            forceWetlab: false,
            forceComputational: false,
            checkedProjects: false,
            programmes: programmes.reduce((map, programme) => {map[programme] = false; return map}, {}),
            rotationID: 0
        }
    }

    async componentDidMount() {
        document.title = "All Projects";
        this.setState((state, props) => ({rotationID: props.rotationID}), () => {
            this.fetchRotation();
        });
        // Get student projects to enforce wetlab/computational constraints
        if (this.props.rotations[this.props.rotationID].data.part === 3) {
            this.props.getStudentProjects(this.props.user);
        }
        // Fetch metadata about all rotations, if the user is a member
        // of staff, so that we can display the dropdown to select a
        // different rotation.
        if (this.props.user.data.permissions.view_projects_predeadline) {
            this.props.fetchAllRotations();
        }
    }

    // Update the filter checkboxes to enforce that experimental
    // projects are shown if the student needs to do an experimental
    // project, or vice versa for computational projects.
    async componentDidUpdate() {
        const rotation = this.props.rotations[this.state.rotationID];
        if (this.props.user.data.permissions.join_projects) {
            // List of projects from the current series which this
            // student is assigned to.
            const studentProjects = Object.keys(this.props.projects).reduce((filtered, id) => {
                const project_rotation = this.props.rotations[this.props.projects[id].data.group_id];
                if (this.props.projects[id].data.student_id === this.props.user.data.id
                    && (project_rotation ? project_rotation.data.series === rotation.data.series : false)) {
                    filtered.push(this.props.projects[id].data);
                }
                return filtered;
            }, []);
            if (rotation.data.part === 3 && studentProjects.length !== 0 && !this.state.checkedProjects) {
                const forceWetlab = !studentProjects.some(project => project.is_wetlab);
                const forceComputational = !studentProjects.some(project => project.is_computational);
                this.setState({
                    forceWetlab: forceWetlab,
                    forceComputational: forceComputational,
                    checkedProjects: true
                });
            }
            else if (rotation.data.part !== 3 && this.state.checkedProjects) {
                this.setState({
                    forceWetlab: false,
                    forceComputational: false,
                    checkedProjects: false
                });
            }
        }
    }

    // Fetch *the projects for* the *current* rotation.
    fetchRotation() {
        const rotation = this.props.rotations[this.state.rotationID];
        this.props.fetchProjects(rotation.data.series, rotation.data.part);
    }

    // Determine whether to show a project based on the filter
    // checkboxes and the programme filter. Also filter out projects
    // which have been assigned to a different user, unless the current
    // user is a member of staff.
    shouldShowProject(project) {
        const programmeFilter = Object.entries(this.state.programmes).filter(kv => kv[1]).map(kv => kv[0]);
        var show = true;
        // Only show wetlab projects if show wetlab is selected        
        show &= this.state.showWetlab || !project.is_wetlab;
        show &= this.state.showComputational || !project.is_computational;
        // If we're forcing wetlab projects to show, always show them
        show &= !this.state.forceWetlab || project.is_wetlab;
        show &= !this.state.forceComputational || project.is_computational;
        if (programmeFilter.length) {
            show &= programmeFilter.some(programme => {
                return project.programmes.includes(programme);
            });
        }
        // Filter out assigned projects unless they are assigned to us or we
        // are allowed to look at projects early
        const assigned = [project.student_id, project.supervisor_id, project.cogs_marker_id];
        if (project.student_id !== null) {
            show &= (assigned.includes(this.props.user.data.id)
                || this.props.user.data.permissions.view_projects_predeadline);
        }
        return show;
    }

    // Render the dropdown to select a previous rotation.
    renderPreviousRotations() {
        const rotationValue = (rotation) => {
            const series = rotation.data.series;
            const part = rotation.data.part;
            return {value: rotation.data.id, label: `${series} rotation ${part}`};
        }

        const rotations = Object.values(this.props.rotations).map(rotationValue);
        const currentRotation = this.props.rotations[this.state.rotationID];
        return (
            <Select
                value={rotationValue(currentRotation)}
                id="previous-rotations-split-button"
                onChange={value => {
                    this.setState({rotationID: value.value}, () => {
                        this.fetchRotation();
                    });
                }}
                options={rotations}
            />
        );
    }

    // Render the filtering options (checkboxes, rotation selection,
    // programme filter).
    renderFilterOptions() {
        return (
            <div className="row">
                <div className="col-xs-4">
                    <label className="btn filter-label">
                        <input 
                            type="checkbox"
                            checked={this.state.showComputational}
                            readOnly={true}
                            disabled={this.state.forceComputational}
                            onClick={() => {
                                this.setState((state, props) => ({
                                    showComputational: !state.showComputational
                                }));
                            }}
                        />
                        Show Computational Projects
                    </label>
                    <label className="btn filter-label">
                        <input 
                            type="checkbox"
                            checked={this.state.showWetlab}
                            readOnly={true}
                            disabled={this.state.forceWetlab}
                            onClick={() => {
                                this.setState((state, props) => ({
                                    showWetlab: !state.showWetlab
                                }));
                            }}
                        />
                        Show Experimental Projects
                    </label>
                </div>
                <div className="col-xs-4">
                    {this.props.user.data.permissions.view_projects_predeadline && this.renderPreviousRotations()}
                </div>
                <div className="col-xs-4">
                    <MultiselectDropDown
                        items = {this.state.programmes}
                        noneSelectedText = "Filter By Programme"
                        onSelect = {programme => {
                            this.setState((state, props) => update(state, {
                                programmes: {$toggle: [programme]}
                            }));
                        }}
                    />
                </div>
            </div>
        );
    }

    render() {
        const rotation = this.props.rotations[this.state.rotationID];
        if (rotation === undefined) return null;
        const projects = Object.keys(this.props.projects).reduce((filtered, id) => {
            if (this.props.projects[id].data.group_id === rotation.data.id) {
                filtered[id] = this.props.projects[id];
            }
            return filtered;
        }, {});
        let text = this.props.fetching? `Fetching ${this.props.fetching} more projects.`: "";
        if (this.props.fetching === 0 && Object.keys(projects).length === 0) {
            text = "There are no projects in this rotation";
        }
        const showVote = this.props.user.data.permissions.join_projects && rotation.data.student_choosable
        return (
            <div className="container">
                {this.renderFilterOptions()}
                <hr/>
                {text}
                {text && showVote && <br/>}
                {showVote && (
                    <p>You may now vote for which projects you would like to do for this rotation. Please select a first, second and third choice that you would be happy doing. You may change your choices freely until the deadline of {rotation.data.deadlines.student_choice.value} 23:59, at which point they will be used to inform the Graduate Office in project allocation.</p>
                )}
                {showVote && (
                    <p>
                        Once you have made your choices, click the following button, and a list of the projects you have voted for will be emailed to you:&nbsp;
                        <button
                            type="submit"
                            className="btn btn-primary btn-sm"
                            onClick={() => (
                                this.props.sendReceipt(this.state.rotationID).then(() => {
                                    Alert.info("Receipt sent")
                                }).catch(() => {
                                    Alert.error("Receipt could not be sent")
                                })
                            )}
                        >
                            Send receipt
                        </button>
                    </p>
                )}
                <ProjectList
                    projects={
                        Object.keys(projects).reduce((filtered, id) => {
                            if (this.shouldShowProject(projects[id].data)) {
                                filtered[id] = projects[id];
                            }
                            return filtered;
                        }, {})
                    }
                    showVote={showVote}
                    displaySupervisorName={true}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.users.users[state.users.loggedInID],
        rotations: state.rotations.rotations,
        rotationID: state.rotations.latestID,
        fetching: state.projects.fetching,
        projects: state.projects.projects
    }
};

const mapDispatchToProps = {
    fetchProjects,
    fetchAllRotations,
    getStudentProjects,
    sendReceipt,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Projects);
