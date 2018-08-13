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


class ProjectList extends Component {
    renderProject(project) {
        return <Project project={project} displaySupervisorName={true}/>;
    }

    render() {
        const noProjects = Object.keys(this.props.projects).length;
        return Object.values(this.props.projects).sort(project => project.data.id).map((project, curProject) =>
            <div key={project.data.id} className="media">
                {this.renderProject(project)}
                {curProject+1 < noProjects ? <hr/>: ""}
            </div>
        );
    }
}


export default ProjectList;