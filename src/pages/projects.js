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
import ProjectList from '../components/project_list.js';
import {programmes} from '../config';
import MultiselectDropDown from '../components/multiselect_dropdown';
import update from 'immutability-helper';
import './projects.css';

class Projects extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showWetlab: true,
            showComputational: true,
            programmes: programmes.reduce((map, programme) => {map[programme] = false; return map}, {})
        }
    }

    async componentDidMount() {
        document.title = "All Projects";
        const rotation = this.props.rotation;
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

    renderFilterOptions() {
        return (
            <div className="row">
                <div className="col-xs-4">
                    <label className="btn filter-label">
                        <input 
                            type="checkbox"
                            checked={this.state.showComputational}
                            readOnly={true}
                            onClick={() => {
                                this.setState(update(this.state, {showComputational: {$set: !this.state.showComputational}}));
                            }}
                        />
                        Show Computational Projects
                    </label>
                </div>
                <div className="col-xs-4">
                    <label className="btn filter-label">
                        <input 
                            type="checkbox"
                            checked={this.state.showWetlab}
                            readOnly={true}
                            onClick={() => {
                                this.setState(update(this.state, {showWetlab: {$set: !this.state.showWetlab}}));
                            }}
                        />
                        Show Wetlab Projects
                    </label>
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
        const projects = Object.keys(this.props.projects).reduce((filtered, id) => {
            if (this.props.projects[id].data.group_id === this.props.rotation.data.id) {
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
                    showVote={this.props.user.data.permissions.join_projects && this.props.rotation.data.student_choosable}
                    displaySupervisorName={true}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.users.users[state.users.loggedInID],
        rotation: state.rotations.rotations[state.rotations.latestID],
        fetching: state.projects.fetching,
        projects: state.projects.projects
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        fetchProjects: (series, part) => dispatch(fetchProjects(series, part))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Projects);