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
import ProjectList from '../components/project_list.js';
import {getSupervisorProjects, getCogsProjects, canMark} from '../actions/users';

class MarkableProjects extends Component {
    async componentDidMount() {
        document.title = "Markable Projects";
        this.props.getSupervisorProjects(this.props.user);
        this.props.getCogsProjects(this.props.user);
    }


    render() {
        const projects = Object.keys(this.props.projects).reduce((filtered, id) => {
            if (canMark(this.props.user, this.props.projects[id])) {
                filtered[id] = this.props.projects[id];
            }
            return filtered;
        }, {});
        let text = this.props.fetching? `Fetching ${this.props.fetching} more projects.`: "";
        if (this.props.fetching === 0 && Object.keys(projects).length === 0) {
            text = "There are no projects you can mark.";
        }
        return (
            <div className="container">
                {text}
                <ProjectList
                    projects={projects}
                    showVote={false}
                    displaySupervisorName={false}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.users.users[state.users.loggedInID],
        fetching: state.projects.fetching,
        projects: state.projects.projects
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        getSupervisorProjects: (user) => dispatch(getSupervisorProjects(user)),
        getCogsProjects: (user) => dispatch(getCogsProjects(user))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MarkableProjects);
