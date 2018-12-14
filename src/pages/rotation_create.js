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
import GroupForm from '../components/group_form';
import update from 'immutability-helper';
import {createRotation} from '../actions/rotations';

import './rotation_create.css'

class RotationCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deadlines: {},
            series: 0,
            part: 0
        };
    }

    async componentDidMount() {
        document.title = "Create Rotation";
        const deadlines = this.props.latestRotation.data.deadlines
        const latest = this.props.latestRotation.data;
        this.setState({
            deadlines: Object.keys(deadlines).reduce((obj, x) => {
                obj[x] = {
                    id: deadlines[x].id,
                    name: deadlines[x].name
                };
                return obj;
            }, {}),
            series: latest.series + (latest.part === 3),
            part: (latest.part % 3) + 1
        });
    }

    onSubmit() {
        const deadlines = Object.keys(this.state.deadlines).reduce((obj, x) => {
            obj[x] = this.state.deadlines[x].value.format("YYYY-MM-DD");
            return obj;
        }, {});
        deadlines.series = this.state.series;
        deadlines.part = this.state.part;
        this.props.createRotation(deadlines);
        this.props.history.push("/");
    }

    renderRotationHeader() {
        return (
            <span>
                <div className="dash">Rotation </div>
                <input
                    type="number"
                    placeholder="Year"
                    required="required"
                    className="form-control year"
                    value={this.state.series}
                    onChange = {(event) => {
                        this.setState(update(this.state, {$merge: {
                            series: parseInt(event.target.value, 10)
                        }}));
                    }}
                />
                <div className="dash">-</div>
                <input
                    type="number"
                    placeholder="Part"
                    required="required"
                    className="form-control part"
                    value={this.state.part}
                    min={1}
                    max={3}
                    onChange = {(event) => {
                        this.setState(update(this.state, {$merge: {
                            part: parseInt(event.target.value, 10)
                        }}));
                    }}
                />
            </span>
        );
    }

    render() {
        return (
            <div className="container">
                <GroupForm 
                    deadlines = {this.state.deadlines}
                    rotationHeader = {this.renderRotationHeader()}
                    submitName = "Create Rotation"
                    updateDeadline = {(deadlineName, date) => {
                        const newDeadline = update(this.state.deadlines[deadlineName], {$merge: {value: date}});
                        this.setState(update(this.state, {deadlines: {$merge: {[deadlineName]: newDeadline}}}));
                    }}
                    onSubmit = {() => {this.onSubmit()}}
                    afterSubmit = {() => {}}
                />
            </div>
        );
    }
}

const mapStateToProps = state => {
    const latestRotation = state.rotations.rotations[state.rotations.latestID];
    return {
        latestRotation
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        createRotation: rotation => dispatch(createRotation(rotation))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RotationCreate);