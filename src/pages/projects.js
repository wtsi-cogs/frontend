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
import {fetchProjects} from '../actions/projects';
import {fetchAllRotations} from '../actions/rotations';
import ProjectList from '../components/project_list.js';
import {programmes} from '../constants';
import Select from 'react-select';
import MultiselectDropDown from '../components/multiselect_dropdown';
import update from 'immutability-helper';
import './projects.css';

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
        this.setState(update(this.state, {rotationID: {$set: this.props.rotationID}}), () => {
            this.fetchRotation();
        });
        // Get student projects to enforce wetlab/computational constraints
        if (this.props.rotations[this.props.rotationID].data.part === 3) {
            this.props.getStudentProjects(this.props.user);
        }
        if (this.props.user.data.permissions.view_projects_predeadline) {
            this.props.fetchAllRotations();
        }
    }

    async componentDidUpdate() {
        const rotation = this.props.rotations[this.state.rotationID];
        if (rotation.data.part === 3 && !this.state.checkedProjects) {
            const studentProjects = Object.keys(this.props.projects).reduce((filtered, id) => {
                if (this.props.projects[id].data.student_id === this.props.user.data.id) {
                    filtered.push(this.props.projects[id].data);
                }
                return filtered;
            }, []);
            const forceWetlab = !studentProjects.some(project => project.is_wetlab);
            const forceComputational = !studentProjects.some(project => project.is_computational);
            this.setState(update(this.state, {
                forceWetlab: {$set: forceWetlab},
                forceComputational: {$set: forceComputational},
                checkedProjects: {$set: true}
            }));
        }
    }

    fetchRotation() {
        const rotation = this.props.rotations[this.state.rotationID];
        this.props.fetchProjects(rotation.data.series, rotation.data.part);
    }

    shouldShowProject(project) {
        const programmeFilter = Object.entries(this.state.programmes).filter(kv => kv[1]).map(kv => kv[0]);
        var show = false;
        // This doesn't show dummy projects but that's fine because they should be assigned a type before they're 'complete'
        show |= this.state.showWetlab && project.is_wetlab;
        show |= this.state.showComputational && project.is_computational;
        if (programmeFilter.length) {
            show &= programmeFilter.some(programme => {
                return project.programmes.includes(programme);
            });
        }
        return show;
    }

    renderPreviousRotations() {
        const rotationValue = (rotation) => {
            const series = rotation.data.series;
            const part = rotation.data.part;
            return {value: rotation.data.id, label: `${series} rotation ${part}`};
        }

        const rotations = Object.values(this.props.rotations).map(rotationValue);
        const currentRotation = this.props.rotations[this.state.rotationID];
        if (currentRotation === undefined) return;
        return (
            <Select
                value={rotationValue(currentRotation)}
                id="previous-rotations-split-button"
                onChange={value => {
                    console.log(value);
                    this.setState(update(this.state, {rotationID: {$set: value.value}}), () => {
                        this.fetchRotation();
                    });
                }}
                options={rotations}
            />
        );
    }

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
                                this.setState(update(this.state, {showComputational: {$set: !this.state.showComputational}}));
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
                                this.setState(update(this.state, {showWetlab: {$set: !this.state.showWetlab}}));
                            }}
                        />
                        Show Wetlab Projects
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
                            this.setState(update(this.state, {
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
        return (
            <div className="container">
                {this.renderFilterOptions()}
                <hr/>
                {text}
                <ProjectList
                    projects={
                        Object.keys(projects).reduce((filtered, id) => {
                            if (this.shouldShowProject(projects[id].data)) {
                                filtered[id] = projects[id];
                            }
                            return filtered;
                        }, {})
                    }
                    showVote={this.props.user.data.permissions.join_projects && rotation.data.student_choosable}
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

const mapDispatchToProps = dispatch => {
    return {
        fetchProjects: (series, part) => dispatch(fetchProjects(series, part)),
        fetchAllRotations: () => dispatch(fetchAllRotations())
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Projects);