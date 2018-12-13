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
import MultiselectDropDown from './multiselect_dropdown';
import RichTextEditor from 'react-rte';
import update from 'immutability-helper';
import { confirmAlert } from 'react-confirm-alert';
import Alert from 'react-s-alert';
import 'react-confirm-alert/src/react-confirm-alert.css' 
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
            authors: this.props.authors
        };
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
            <div className="col-xs-2">
                <button
                    type="button"
                    className="btn btn-danger btn-lg"
                    onClick={() => {confirmAlert({
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
            </div>
        );
    }

    render() {
        return (
            <div className="container">
                <div className="col-md-1"></div>
                <div className="col-md-10">
                    <div className="well well-sm">
                        <div className="row">
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
                                            this.setState(update(this.state, {$merge: {
                                                title: event.target.value
                                            }}));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-7">
                                <div className="form-group">
                                    <label htmlFor="authors">Others involved</label>
                                    <input
                                        type="text"
                                        id="authors"
                                        className="form-control"
                                        value={this.state.authors}
                                        onChange = {(event) => {
                                            this.setState(update(this.state, {$merge: {
                                                authors: event.target.value
                                            }}));
                                        }}
                                    />
                                </div>
                            </div>
                            <div className="col-sm-5">
                                <label className="btn"><input type="radio" checked={this.state.wetlab & !this.state.computational} readOnly={true} onClick={() => {
                                    this.setState(update(this.state, {$merge: {
                                        wetlab: true,
                                        computational: false
                                    }}));
                                }}/> Wetlab</label>
                                <label className="btn"><input type="radio" checked={!this.state.wetlab & this.state.computational} readOnly={true} onClick={() => {
                                    this.setState(update(this.state, {$merge: {
                                        wetlab: false,
                                        computational: true
                                    }}));
                                }}/> Computational</label>
                                <label className="btn"><input type="radio" checked={this.state.wetlab & this.state.computational} readOnly={true} onClick={() => {
                                    this.setState(update(this.state, {$merge: {
                                        wetlab: true,
                                        computational: true
                                    }}));
                                }}/> Both</label>
                            </div>
                            <div className="col-sm-7">
                                <MultiselectDropDown
                                    items = {this.state.programmes}
                                    noneSelectedText = "No programme"
                                    onSelect = {programme => {
                                        const programmes = update(this.state.programmes, {$merge: {
                                            [programme]: !this.state.programmes[programme]
                                        }});
                                        this.setState(update(this.state, {$merge: {
                                            programmes
                                        }}));
                                    }}
                                />
                            </div>
                            <div className="col-xs-12 form-group">
                                <RichTextEditor
                                    value={this.state.abstract}
                                    onChange={(value) => {
                                        this.setState(update(this.state, {$merge: {
                                            abstract: value
                                        }}));
                                    }}
                                    readOnly={false}
                                    className="abstract"
                                    editorClassName="abstract_inner"
                                />
                            </div>
                            <div className="col-xs-3">
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg"
                                    onClick={() => this.submitCheck()}
                                >
                                    {this.props.submitLabel}
                                </button>
                                <br/>
                                {this.props.extraLabel}
                            </div>
                            {this.props.onDelete && this.renderDelete()}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default ProjectEditor;