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
import {programmes} from '../constants';
import {editProject, deleteProject, fetchProject} from '../actions/projects';

class ProjectEdit extends Component {
    constructor(props) {
        super(props);
        props.fetchProject(props.match.params.projectID);
    }

    async componentDidMount() {
        document.title = "Edit Project";
    }

    render() {
        const projects = this.props.projects;
        const projectID = this.props.match.params.projectID;
        if (!projects.hasOwnProperty(projectID)) {
            return (
                <div className="container">
                    Loading project...
                </div>
            );
        }
        const project = projects[projectID].data;
        return (
            <ProjectEditor
                title={project.title}
                authors={project.small_info}
                abstract = {project.abstract}
                programmes = {programmes.reduce((map, programme) => {map[programme] = project.programmes.includes(programme); return map}, {})}
                wetlab = {project.is_wetlab}
                computational = {project.is_computational}
                student={project.student_id}
                submitLabel="Edit Project"
                onSubmit={project => {
                    this.props.editProject(
                        projectID,
                        project,
                        () => Alert.info(`"${project.title}" saved`),
                        () => Alert.error(`Failed to edit "${project.title}"`),
                    );
                }}
                onDelete={() => {
                    this.props.deleteProject(projectID);
                    Alert.info(`"${project.title}" deleted.`);
                    this.props.history.push("/");
                }}
            />
        );
    }
}

const mapStateToProps = state => {
    return {
        projects: state.projects.projects
    }
};  

const mapDispatchToProps = {
    fetchProject,
    editProject,
    deleteProject,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectEdit);
