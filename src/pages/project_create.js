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
import ProjectEditor from '../components/project_editor';
import {programmes} from '../config';
import {createProject} from '../actions/projects';

class ProjectCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programmes: programmes.reduce((map, programme) => {map[programme] = false; return map}, {})
        };
    }

    async componentDidMount() {
        document.title = "Create Project";
    }

    render() {
        return (
            <ProjectEditor
                title=""
                authors=""
                abstract = ""
                programmes = {this.state.programmes}
                wetlab = {false}
                computational = {false}
                submitLabel="Create Project"
                onSubmit={project => {
                    this.props.createProject(project);
                    Alert.info(`${project.title} created`);
                    this.props.history.push("/");
                }}
            />
        );
    }
}

const mapStateToProps = state => {
    return {}
};  

const mapDispatchToProps = dispatch => {
    return {
        createProject: project => dispatch(createProject(project))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectCreate);