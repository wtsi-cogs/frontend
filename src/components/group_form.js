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


import React, {Component, Fragment} from 'react';
import DatePicker from 'react-datepicker';
import ClassNames from 'classnames';
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';

import {developer} from '../config';
import InfoButton from '../components/info_button';

import './datepicker.css';


const DEADLINE_DESCRIPTIONS = {
    supervisor_submit: "Supervisors can still submit projects after this date, if they need to.",
    student_invite: "Supervisors can still submit projects after this date, if they need to.",
    student_choice: <Fragment>
        <p>After this date:</p>
        <ul>
            <li>Students cannot change their project choices (even if they have not submitted any choices yet)</li>
            <li>New projects cannot be submitted</li>
        </ul>
        <p>You will only be able to create the next rotation once this deadline has passed and you have finalised project assignments.</p>
    </Fragment>,
    student_complete: <Fragment>
        <p>There is a three-day 'grace period' after this date, where students can still reupload their reports. At the end of the grace period, markers (supervisors and CoGS members) will be emailed reports to mark.</p>
        <p>If a student has not uploaded a report by the end of the grace period, they will be sent an email reminder (and their supervisor will be CC'd). They can still upload their report, and it will be sent to markers at the end of the day.</p>
    </Fragment>,
    marking_complete: "Markers can continue to mark reports after this date.",
};


class GroupForm extends Component {
    renderDateBox(deadlineName, deadline, valid) {
        return (
            <div key={deadline.id}>
                <b>{deadline.name}</b>
                {DEADLINE_DESCRIPTIONS[deadlineName] && <Fragment>
                    {" "}<InfoButton id={`${deadlineName}_info`} placement="bottom">
                        {DEADLINE_DESCRIPTIONS[deadlineName]}
                    </InfoButton>
                </Fragment>}
                <br/>
                <DatePicker
                    selected={deadline.value}
                    className={ClassNames("form-control", {"invalid-date": !valid})}
                    // Allow any date to be picked in developer mode, but
                    // otherwise the date must not be before today.
                    filterDate={date => (
                        developer || date.isAfter(moment(new Date()).subtract(1, "days"))
                    )}
                    dateFormat="DD/MM/YYYY"
                    onChange={(date) => {this.props.updateDeadline(deadlineName, date)}}
                />
            </div>);
    }

    render() {
        const validity = Object.values(this.props.deadlines).map((deadline, i) => {
            const date = deadline.value;
            // Unfilled entries are invalid
            if (date === undefined) {return false}
            const deadlines = Object.values(this.props.deadlines).slice(i+1).map(deadline=>deadline.value).filter(deadline=>deadline!==undefined);
            // The last valid deadline has no constraints
            if (deadlines.length === 0) {return true}
            // Otherwise, deadlines are only valid if the input is before every deadline after
            return deadlines.every(deadline=>date.isBefore(deadline));
        });
        return (
            <div>
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <div className="well well-sm">
                        <div className="row">
                            <div className="col-sm-4 col-sm-push-7">
                                { this.props.rotationHeader }
                            </div>
                            <div className="col-sm-6 col-sm-pull-3">
                                {Object.keys(this.props.deadlines).map((deadline, i) => this.renderDateBox(deadline, this.props.deadlines[deadline], validity[i]))}
                            </div>
                        </div>
                        <br/>
                        <div className="row">
                            <div className="col-xs-12 col-sm-10 col-sm-push-1">
                                <div className="btn-toolbar">
                                    <button
                                        type="submit"
                                        className="btn btn-primary btn-lg"
                                        onClick={this.props.onSubmit}
                                        disabled={!validity.every(i=>i)}
                                    >
                                        {this.props.submitName}
                                    </button>
                                    { this.props.afterSubmit() }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="clearfix"></div>
            </div>
        );
    }
}

export default GroupForm;
