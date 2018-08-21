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
import {fetchLatestSeries, saveRotation} from '../actions/rotations';
import {getSupervisorProjects, getCogsProjects} from '../actions/users';
import GroupEditor from './group_editor';
import ProjectList from '../components/project_list.js';

class MainPage extends Component {
    async componentDidMount() {
        document.title = "Dashboard";
        this.props.fetchLatestSeries();
        this.props.getSupervisorProjects(this.props.user);
        this.props.getCogsProjects(this.props.user);
    }

    renderRotations() {
        return Object.values(this.props.rotations).sort(rotation => rotation.data.part).map(rotation =>
            <GroupEditor
                key = {rotation.data.part}
                group = {rotation}
                onSave = {this.props.saveRotation}
            />
        );
    }

    renderSupervisorProjects() {
        const allProjects = this.props.projects;
        const projects = Object.keys(allProjects).reduce((filtered, id) => {
            if (allProjects[id].data.supervisor_id === this.props.user.data.id) {
                filtered[id] = allProjects[id];
            }
            return filtered;
        }, {});
        return <div>
            <h4>Projects I own</h4>
            <ProjectList 
                projects={projects}
                showVote={false}
                displaySupervisorName={false}
            />
        </div>
    }

    renderCogsProjects() {
        const allProjects = this.props.projects;
        const projects = Object.keys(allProjects).reduce((filtered, id) => {
            if (allProjects[id].data.cogs_marker_id === this.props.user.data.id) {
                filtered[id] = allProjects[id];
            }
            return filtered;
        }, {});
        return <div>
            <h4>Projects I'm a CoGS marker for</h4>
            <ProjectList projects={projects} showVote={false}/>
        </div>
    }

    render() {
        return (
            <div className="container">
                <h4>Welcome, {this.props.user.data.name}</h4>
                <div className="clearfix"></div>
                {this.props.user.data.permissions.create_project_groups && this.renderRotations()}
                {this.props.user.data.permissions.create_projects && this.renderSupervisorProjects()}
                {this.props.user.data.permissions.review_other_projects && this.renderCogsProjects()}
            </div>
        );
    }
}

const mapStateToProps = state => {
    const allRotations = state.rotations.rotations;
    const latestSeries = allRotations[state.rotations.latestID].data.series;
    const rotations = Object.keys(allRotations).reduce((filtered, id) => {
        if (allRotations[id].data.series === latestSeries) {
            filtered[id] = allRotations[id];
        }
        return filtered;
    }, {});

    return {
        user: state.users.users[state.users.loggedInID],
        projects: state.projects.projects,
        rotations
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        saveRotation: rotation => dispatch(saveRotation(rotation)),
        fetchLatestSeries: () => dispatch(fetchLatestSeries()),
        getSupervisorProjects: (user) => dispatch(getSupervisorProjects(user)),
        getCogsProjects: (user) => dispatch(getCogsProjects(user))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MainPage);