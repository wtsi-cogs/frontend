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

class Projects extends Component {
    async componentDidMount() {
        document.title = "All Projects";
    }


    render() {
        if (this.props.user === null) {
            return "";
        }
        let text = this.props.fetching? `Fetching ${this.props.fetching} more projects.`: "";
        if (this.props.fetching === 0 && Object.keys(this.props.projects).length === 0) {
            text = "There are no projects in this rotation";
        }
        return (
            <div className="container">
                {text}
                <ProjectList projects={this.props.projects}/>
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
        user: state.users.users[state.users.loggedInID].data,
        fetching: state.projects.fetching,
        projects: state.projects.projects
    }
};  

const mapDispatchToProps = dispatch => {
    return {
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Projects);