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

class ChoiceEditor extends Component {
    getProjectTitle(projectID) {
        const project = this.props.projects[projectID];
        if (!project) {
            return "";
        }
        return project.data.title;
    }

    renderOverride(user) {
        return (
            <div className="col-xs-3">Override</div>
        );
    }

    renderStudentChoices() {
        const projects = this.props.projects;
        return Object.entries(this.props.users).map((kv) => {
            const [id, userAll] = kv;
            const user = userAll.data;
            return (
                <div className="row" key={id}>
                    <div className="col-xs-3">{user.name}</div>
                    <div className="col-xs-2">{this.getProjectTitle(user.first_option_id)}</div>
                    <div className="col-xs-2">{this.getProjectTitle(user.second_option_id)}</div>
                    <div className="col-xs-2">{this.getProjectTitle(user.third_option_id)}</div>
                    {this.props.showOverride && this.renderOverride(user)}
                </div>
            );
        });
    }

    render() {
        return (
            <div className="container-fluid">            
                <div className="row">
                    <div className="col-xs-3">Student</div>
                    <div className="col-xs-2">First Choice</div>
                    <div className="col-xs-2">Second Choice</div>
                    <div className="col-xs-2">Third Choice</div>
                    {this.props.showOverride && <div className="col-xs-3">Override</div>}
                </div>
                {this.renderStudentChoices()}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        fetching: state.users.fetching

    }
};  

const mapDispatchToProps = dispatch => {
    return {
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ChoiceEditor);