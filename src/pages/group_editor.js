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
import ClassNames from 'classnames';
import GroupForm from '../components/group_form';
import moment from 'moment';
import styledAlert from '../components/styledAlert';
import update from 'immutability-helper';
import {groupAttrs} from '../constants';
import {developer} from '../config';

import './group_editor.css';

class GroupEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deltaDeadlines: {},
            deltaAttrs: {},
            showAdvance: false
        }
    }

    updateDeadline(deadline, dateString) {
        return update(deadline, {$merge: {value: moment.utc(dateString)}});
    }

    deadlinesFromProps() {
        return Object.keys(this.props.group.data.deadlines).reduce((obj, x) => {
            const deadline = this.props.group.data.deadlines[x];
            obj[x] = this.updateDeadline(deadline, moment.utc(this.props.group.data.deadlines[x].value));
            return obj;
        }, {});
    }

    getAttrs() {
        return Object.keys(this.state.deltaAttrs).reduce((obj, attr) => {
            obj[attr] = this.state.deltaAttrs[attr];
            return obj;
        }, Object.keys(this.props.group.data).reduce((obj, key) => {
            if (groupAttrs.includes(key)) {
                obj[key] = this.props.group.data[key];
            }
            return obj;
        }, {}));
    }

    async onSubmit() {
        const origDeadlines = this.deadlinesFromProps();
        let finalDeadlines = {}
        Object.keys(origDeadlines).forEach(key => {
            finalDeadlines[key] = origDeadlines[key].value.format("YYYY-MM-DD");
        });
        Object.keys(this.state.deltaDeadlines).forEach(key => {
            finalDeadlines[key] = this.state.deltaDeadlines[key].format("YYYY-MM-DD");
        });
        this.props.onSave({
            id: this.props.group.data.id,
            deadlines: finalDeadlines,
            attrs: this.getAttrs()
        });
    }

    render() {
        const deadlines = this.deadlinesFromProps();
        Object.keys(this.state.deltaDeadlines).forEach(key => {
            deadlines[key].value = this.state.deltaDeadlines[key];
        });
        const attrs = this.getAttrs();
        return (
            <GroupForm 
                deadlines = {deadlines}
                rotationHeader = {
                    <div>
                        <h2>Rotation {this.props.group.data.part}</h2>
                        {developer && (
                            <h5 
                                className="rotation-edit-advanced"
                                onClick={() => {
                                    this.setState(update(this.state, {$set: {showAdvance: !this.state.showAdvance}}));
                                }}
                            >
                                Developer
                                <div className={ClassNames("caret", {"rotation-edit-caret-rotate": !this.state.showAdvance})}></div>
                            </h5>
                        )}
                        {this.state.showAdvance && (
                                <div>
                                    {groupAttrs.map(attr => {
                                        return (
                                            <div key={attr}>
                                                <label className="rotation-edit-advanced">
                                                    <input 
                                                        type="checkbox"
                                                        name={attr} 
                                                        checked={attrs[attr]}
                                                        readOnly={true}
                                                        onClick={() => {
                                                            this.setState(update(this.state, {deltaAttrs: (obj) => {
                                                                return Object.assign(obj, {[attr]: !(obj[attr] === undefined? this.props.group.data[attr]: obj[attr])});
                                                            }}));
                                                        }}
                                                    />
                                                    {attr}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                    </div>
                }
                submitName = "Save Rotation"
                updateDeadline = {(deadlineName, date) => {
                    this.setState(update(this.state, {deltaDeadlines: {$merge: {[deadlineName]: date}}}));
                }}
                onSubmit = {() => {this.onSubmit()}}
                afterSubmit = {() => {
                    return ( !this.props.group.data.student_viewable &&
                        <button
                            type="submit"
                            className="btn btn-warning btn-lg"
                            id="remind-button"
                            onClick={() => {
                                styledAlert({
                                    title: "Email Supervisors",
                                    message: (
                                        <p>
                                            You're about to send an email to supervisors reminding them to submit projects.
                                            <br/>
                                            { this.props.group.data.manual_supervisor_reminders && (
                                                `The last time a manual reminder was sent to all supervisors was on ${this.props.group.data.manual_supervisor_reminders}`
                                            )}
                                        </p>
                                    ),
                                    buttons: [
                                        {label: "Yes", onClick: () => {
                                            this.props.sendReminder();
                                        }},
                                        {label: "No", onClick: () => {}},
                                    ]
                                })
                            }}
                        >
                            Remind Supervisors
                        </button>
                    );
                }}
            />
        );
    }
}

export default GroupEditor;
