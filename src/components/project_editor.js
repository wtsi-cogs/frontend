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
import {connect} from 'react-redux';
import MultiselectDropDown from './multiselect_dropdown';
import RichTextEditor from 'react-rte';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import update from 'immutability-helper';
import Alert from 'react-s-alert';
import 'react-confirm-alert/src/react-confirm-alert.css'
import {fetchAllUsers} from '../actions/users';
import styledAlert from '../components/styledAlert';
import './project_editor.css';

class ProjectEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            programmes: this.props.programmes,
            abstract: RichTextEditor.createValueFromString(this.props.abstract, 'html'),
            wetlab: this.props.wetlab,
            computational: this.props.computational,
            title: this.props.title,
            authors: this.props.authors,
            student: this.props.student,
        };
    }

    async componentDidMount() {
        this.props.fetchAllUsers();
    }

    submitCheck() {
        let success = true;
        if (!this.state.title) {
            Alert.error("Projects must have a title");
            success = false;
        }
        if (!Object.values(this.state.programmes).some(i=>i)) {
            Alert.error("Projects must have at least one programme");
            success = false;
        }
        if (!this.state.abstract.toString("html")) {
            Alert.error("Projects must have an abstract");
            success = false;
        }
        if (!(this.state.wetlab || this.state.computational)) {
            Alert.error("Projects must be either computational or wetlab");
            success = false;
        }
        if (success) {
            const state = update(this.state, {$merge: {
                abstract: this.state.abstract.toString("html"),
                programmes: Object.entries(this.state.programmes).filter(([k,v])=>v).map(([k,v])=>k)
            }})
            this.props.onSubmit(state)
        };
    }

    renderDelete() {
        return (
            <button
                type="button"
                className="btn btn-danger btn-lg"
                onClick={() => {styledAlert({
                    title: "Delete Project",
                    message: `You are about to delete "${this.state.title}". Do you wish to continue?`,
                    buttons: [
                        {label: "Yes", onClick: () => {this.props.onDelete()}},
                        {label: "No", onClick: () => {}},
                    ]
                })}}
            >
                Delete Project
            </button>
        );
    }

    render() {
        return (
            <div className="container">
                <div className="col-md-1"></div>
                <div className="col-md-10">
                    <div className="well well-sm">
                        <div className="row form-group">
                            <div className="col-sm-5">
                                <div>
                                    <label htmlFor="name">Project title</label>
                                    <input 
                                        type="text"
                                        placeholder="Enter title"
                                        required="required"
                                        id="name"
                                        className="form-control"
                                        value={this.state.title}
                                        onChange = {(event) => {
                                            this.setState({
                                                title: event.target.value
                                            });
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-7">
                                <label htmlFor="authors">Others involved</label>
                                <input
                                    type="text"
                                    id="authors"
                                    className="form-control"
                                    value={this.state.authors}
                                    onChange = {(event) => {
                                        this.setState({
                                            authors: event.target.value
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-sm-5">
                                <label className="btn"><input type="radio" checked={this.state.wetlab & !this.state.computational} readOnly={true} onClick={() => {
                                    this.setState({
                                        wetlab: true,
                                        computational: false
                                    });
                                }}/> Wetlab</label>
                                <label className="btn"><input type="radio" checked={!this.state.wetlab & this.state.computational} readOnly={true} onClick={() => {
                                    this.setState({
                                        wetlab: false,
                                        computational: true
                                    });
                                }}/> Computational</label>
                                <label className="btn"><input type="radio" checked={this.state.wetlab & this.state.computational} readOnly={true} onClick={() => {
                                    this.setState({
                                        wetlab: true,
                                        computational: true
                                    });
                                }}/> Both</label>
                            </div>
                            <div className="col-sm-7">
                                <MultiselectDropDown
                                    items = {this.state.programmes}
                                    noneSelectedText = "No programme"
                                    onSelect = {programme => {
                                        const programmes = update(this.state.programmes, {
                                            $toggle: [programme]
                                        });
                                        this.setState({
                                            programmes
                                        });
                                    }}
                                />
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-xs-7">
                                If this project is intended for a particular student, you can pre-assign it to them. This will prevent the project from being selected by other students.
                            </div>
                            <div className="col-xs-5">
                                <DropdownButton
                                    title={this.props.students.hasOwnProperty(this.state.student) ? this.props.students[this.state.student].data.name : "Any student"}
                                    id="assign_student_dropdown"
                                    className="form-control"
                                >
                                    {[null].concat(Object.keys(this.props.students)).map(userID => (
                                        <MenuItem
                                            eventKey={userID}
                                            key={userID}
                                            onSelect={userID => {
                                                this.setState({student: userID !== null ? parseInt(userID, 10) : null})
                                            }}
                                        >
                                            {userID !== null ? this.props.students[userID].data.name : "Any student"}
                                        </MenuItem>
                                    ))}
                                </DropdownButton>
                            </div>
                        </div>
                        <div className="row form-group">
                            <div className="col-xs-12">
                                <RichTextEditor
                                    value={this.state.abstract}
                                    onChange={(value) => {
                                        this.setState({
                                            abstract: value
                                        });
                                    }}
                                    readOnly={false}
                                    className="abstract"
                                    editorClassName="abstract_inner"
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12">
                                <div className="btn-toolbar">
                                    <button
                                        type="button"
                                        className="btn btn-primary btn-lg"
                                        onClick={() => this.submitCheck()}
                                    >
                                        {this.props.submitLabel}
                                    </button>
                                    {this.props.onDelete && this.renderDelete()}
                                </div>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-xs-12">
                                {this.props.extraLabel}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    students: Object.entries(state.users.users).reduce((users, [id, user]) => {
        if (user.data.user_type.includes("student")) {
            users[id] = user;
        }
        return users;
    }, {}),
})

const mapDispatchToProps = {
    fetchAllUsers,
}

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ProjectEditor);
