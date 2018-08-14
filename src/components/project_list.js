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
import Project from './project';
import { connect } from 'react-redux';
import {voteProject} from '../actions/users';


class ProjectList extends Component {
    constructor(props) {
        super(props);
        this.state = {pressed: {}}
    }

    getPressedState(project) {
        if (!this.props.user) {return -1}
        if (this.props.user.first_option_id === project.data.id) {return 1}
        if (this.props.user.second_option_id === project.data.id) {return 2}
        if (this.props.user.third_option_id === project.data.id) {return 3}
        return 4;
    }

    renderProject(project) {
        return <Project project={project} pressed={this.getPressedState(project)} onClick={this.props.voteProject} showVote={this.props.showVote} displaySupervisorName={true}/>;
    }

    render() {
        const noProjects = Object.keys(this.props.projects).length;
        return Object.values(this.props.projects).map((project, curProject) =>
            <div key={project.data.id}>
                <div className="media">
                    {this.renderProject(project)}
                </div>
                {curProject+1 < noProjects ? <hr/>: ""}
            </div>
        );
    }
}


const mapStateToProps = state => {
    if (state.users.loggedInID === null) {
        return {
            user: null
        }
    }

    return {
        user: state.users.users[state.users.loggedInID].data
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        voteProject: (projectID, option) => dispatch(voteProject(projectID, option))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectList);