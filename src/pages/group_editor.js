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
import GroupForm from '../components/group_form';
import moment from 'moment';
import update from 'immutability-helper';

class GroupEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {deltaDeadlines: {}}
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
            deadlines: finalDeadlines
        });
    }

    render() {
        const deadlines = this.deadlinesFromProps();
        Object.keys(this.state.deltaDeadlines).forEach(key => {
            deadlines[key].value = this.state.deltaDeadlines[key];
        });

        return (
            <GroupForm 
                deadlines = {deadlines}
                rotationName = {"Rotation " + this.props.group.data.part}
                submitName = "Edit Group"
                enableSubmit = {true}
                updateDeadline = {(deadlineName, date) => {
                    this.setState(update(this.state, {deltaDeadlines: {$merge: {[deadlineName]: date}}}));
                }}
                onSubmit = {() => {this.onSubmit()}}
            />
        );
    }
}

export default GroupEditor;