import React, {Component} from 'react';
import GroupForm from '../components/group_form';
import moment from 'moment';
import update from 'immutability-helper';
import api_url from '../config.js'

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
        console.log(finalDeadlines);
        await fetch(api_url+"/series/"+this.props.group.data.series+"/"+this.props.group.data.part, {
            method: "PUT",
            body: JSON.stringify(finalDeadlines)
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
                updateDeadline = {(deadlineName, date) => {
                    this.setState(update(this.state, {deltaDeadlines: {$merge: {[deadlineName]: date}}}));
                }}
                onSubmit = {() => {this.onSubmit()}}
            />
        );
    }
}

export default GroupEditor;