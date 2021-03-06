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
import {Link} from 'react-router-dom';
import ClassNames from 'classnames';
import Alert from 'react-s-alert';
import GroupForm from '../components/group_form';
import moment from 'moment';
import styledAlert from '../components/styledAlert';
import update from 'immutability-helper';
import {groupAttrs} from '../constants';
import {developer} from '../config';
import InfoButton from '../components/info_button';

import './group_editor.css';

// A box listing the details of a rotation (deadlines and current
// state), with a button to remind supervisors to submit projects (only
// displayed if the rotation is not yet visible to students).
//
// Props:
// - group
// - sendReminder
class GroupEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deltaDeadlines: {},
            deltaAttrs: {},
            showAdvance: false
        }
    }

    // Return a new deadline object with the date changed based on the
    // parsed passed string.
    updateDeadline(deadline, dateString) {
        return update(deadline, {$merge: {value: moment.utc(dateString)}});
    }

    // (As best I can tell:) Return the deadlines passed in props, with
    // date strings converted to `moment`s.
    deadlinesFromProps() {
        return Object.keys(this.props.group.data.deadlines).reduce((obj, x) => {
            const deadline = this.props.group.data.deadlines[x];
            // TODO: why the hell are you passing a `moment` to a
            // function whose sole job is to call `moment` on a string!?
            obj[x] = this.updateDeadline(deadline, moment.utc(this.props.group.data.deadlines[x].value));
            return obj;
        }, {});
    }

    // Overlay the changed rotation attributes on top of the existing
    // attributes.
    getAttrs() {
        // Read this function from bottom to top -- the second reduce is
        // evaluated first. (Why was it written like this? Who knows.)
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

    // Save the entered deadlines and attributes, in a vastly
    // overcomplicated manner.
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
        const now = moment();
        const attrs = this.getAttrs();
        const rotation = this.props.group.data;
        let rotationState = null;
        if (!rotation.student_viewable) {
            // Guard against the initial rotation, which is not visible but read-only.
            if (rotation.read_only) {
                rotationState = <p>Please create a new rotation. <InfoButton id="dummy-rotation-information" title="Why is this necessary?">
                    <p>This rotation is automatically generated and exists for technical reasons. You should not alter this rotation.</p>
                    <p>To allow other users to use the Student Portal, you will need to create a new rotation.</p>
                </InfoButton></p>;
            } else {
                rotationState = <p>Waiting for supervisors to submit project proposals.</p>;
            }
        } else if (rotation.student_choosable) {
            rotationState = <p>Waiting for students to choose projects.</p>;
        } else if (rotation.can_finalise) {
            rotationState = <p>Ready for you to <Link to={`/rotations/${rotation.series}/${rotation.part}/choices`}>finalise student choices</Link>.</p>;
        } else if (rotation.student_uploadable) {
            rotationState = <p>Students are completing their projects.</p>;
            if (now >= deadlines.student_complete.value.clone().hour(23).minute(59)) {
                rotationState = <p>Markers are marking submitted projects.</p>;
            }
            // TODO: check that all projects are actually marked before
            // displaying this.
            if (now >= deadlines.marking_complete.value.clone().hour(23).minute(59)) {
                rotationState = <p>Rotation is finished.</p>;
            }
        }
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
                                    this.setState((state, props) => ({showAdvance: !state.showAdvance}));
                                }}
                            >
                                Developer
                                <div className={ClassNames("caret", {"rotation-edit-caret-rotate": !this.state.showAdvance})}></div>
                            </h5>
                        )}
                        {this.state.showAdvance && (
                            <div>
                                {groupAttrs.map(attr => (
                                    <div key={attr}>
                                        <label className="rotation-edit-advanced">
                                            <input
                                                type="checkbox"
                                                name={attr}
                                                checked={attrs[attr]}
                                                readOnly={true}
                                                onClick={() => {
                                                    this.setState((state, props) => update(state, {deltaAttrs: (obj) => (
                                                        Object.assign(obj, {[attr]: !(obj[attr] === undefined? props.group.data[attr]: obj[attr])})
                                                    )}));
                                                }}
                                            />
                                            {attr}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="rotation-subtitle">{rotationState}</div>
                    </div>
                }
                submitName = "Save Rotation"
                updateDeadline = {(deadlineName, date) => {
                    this.setState((state, props) => update(state, {deltaDeadlines: {$merge: {[deadlineName]: date}}}));
                }}
                onSubmit = {() => {
                    // Guard against modifying the initial dummy rotation.
                    if (!this.props.group.data.student_viewable && this.props.group.data.read_only) {
                        Alert.error("Please create a new rotation.");
                    } else {
                        this.onSubmit();
                    }
                }}
                afterSubmit = {() => {
                    return ( !this.props.group.data.student_viewable && !this.props.group.data.read_only &&
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
