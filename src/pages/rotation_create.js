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

// Page for creating a new rotation. Accessible by members of the
// Graduate Office.
class RotationCreate extends Component {
    constructor(props) {
        super(props);
        this.state = {
            deadlines: {},
            series: 0,
            part: 0
        };
    }

    // Automatically set the series and part to follow on from the
    // previous rotation.
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

    // Submit the new rotation to the server.
    onSubmit() {
        const deadlines = Object.keys(this.state.deadlines).reduce((obj, x) => {
            obj[x] = this.state.deadlines[x].value.format("YYYY-MM-DD");
            return obj;
        }, {});
        deadlines.series = this.state.series;
        deadlines.part = this.state.part;
        this.props.createRotation(deadlines).then(() => {
            this.props.history.push("/");
        });
    }

    // Render the "Rotation {n}" title, and the series and part inputs.
    renderRotationHeader() {
        return (
            <span className="rotation-series-part-inputs">
                <span className="dash">Rotation </span>
                <input
                    type="number"
                    placeholder="Year"
                    required="required"
                    className="form-control year"
                    value={this.state.series}
                    onChange = {(event) => {
                        this.setState({
                            series: parseInt(event.target.value, 10)
                        });
                    }}
                />
                <span className="dash">&ndash;</span>
                <input
                    type="number"
                    placeholder="Part"
                    required="required"
                    className="form-control part"
                    value={this.state.part}
                    min={1}
                    max={3}
                    onChange = {(event) => {
                        this.setState({
                            part: parseInt(event.target.value, 10)
                        });
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
                        this.setState((state, props) => {
                            const newDeadline = update(state.deadlines[deadlineName], {$merge: {value: date}});
                            return update(state, {
                                deadlines: {$merge: {[deadlineName]: newDeadline}}
                            });
                        });
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

const mapDispatchToProps = {
    createRotation,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(RotationCreate);
