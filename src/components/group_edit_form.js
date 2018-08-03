import React, {Component} from 'react';
import moment from 'moment';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker.css'


class GroupEditForm extends Component {

    DateBox(deadline) {
        console.log(deadline); 
        return (
            <div key={deadline.id}>
                <b>{deadline.name}</b>
                <DatePicker
                    selected={moment.utc(deadline.value)}
                    filterDate={date => moment.utc(deadline.value).isBefore(date.add(1, "days"))}
                />
            </div>);
    }

    render() {
        const deadlines = this.props.group.data.deadlines;
        console.log(deadlines);
        return (
            <div>
                <div className="col-md-2"></div>
                <div className="col-md-8">
                    <div className="well well-sm">
                        <form>
                            <div className="row">
                                <div className="col-sm-6 col-sm-push-5">
                                    { this.props.group && 
                                        <div>
                                            <div className="pull-right visible-sm-block visible-md-block visible-lg-block">
                                                <h2>Rotation { this.props.group.data.part }</h2>
                                            </div>
                                            <div className="visible-xs-block">
                                                <h2>Rotation { this.props.group.data.part }</h2>
                                            </div>
                                        </div>
                                    }
                                </div>
                                <div className="col-sm-6 col-sm-pull-5">
                                    {Object.getOwnPropertyNames(deadlines).map(deadline => this.DateBox(deadlines[deadline]))}
                                    <br/>
                                    <button type="submit" className="btn btn-primary btn-lg">{this.props.submitName}</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="clearfix"></div>
            </div>
        );
    }
}

export default GroupEditForm;