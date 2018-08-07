import React, {Component} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css';
import moment from 'moment';


class GroupForm extends Component {
    DateBox(deadlineName, deadline) {
        return (
            <div key={deadline.id}>
                <b>{deadline.name}</b>
                <DatePicker
                    selected={deadline.value}
                    filterDate={date => date.isAfter(moment(new Date()).subtract(1, "days"))}
                    dateFormat="DD/MM/YYYY"
                    onChange={(date) => {this.props.updateDeadline(deadlineName, date)}}
                />
            </div>);
    }

    render() {
        return (
            <div>
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <div className="well well-sm">
                        <div className="row">
                            <div className="col-sm-6 col-sm-push-5">
                                <div>
                                    <div className="pull-right visible-sm-block visible-md-block visible-lg-block">
                                        <h2>{ this.props.rotationName }</h2>
                                    </div>
                                    <div className="visible-xs-block">
                                        <h2>{ this.props.rotationName }</h2>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-6 col-sm-pull-5">
                                {Object.keys(this.props.deadlines).map(deadline => this.DateBox(deadline, this.props.deadlines[deadline]))}
                                <br/>
                                <button type="submit" className="btn btn-primary btn-lg" onClick={this.props.onSubmit}>{this.props.submitName}</button>
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