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
import {userRoles} from '../config.js';
import {DropdownButton, MenuItem} from 'react-bootstrap';
import update from '../../node_modules/immutability-helper';
import {fetchAllUsers, saveUser} from '../actions/users';
import './user_edit.css';

class UserEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: {},
            dropdownOpen: null
        }
    }

    async componentDidMount() {
        document.title = "User Editor";
        this.props.fetchAllUsers();
    }

    async componentDidUpdate() {
        console.log("Updated");
        Object.values(this.props.users).forEach(user => {
            if (!this.state.users.hasOwnProperty(user.data.id)) {
                this.setState(update(this.state, {
                    users: {$merge: {[user.data.id]: {
                        name: user.data.name,
                        email: user.data.email,
                        priority: user.data.priority,
                        user_type: user.data.user_type
                    }}}
                }));
            }
        });
    }

    save() {
        Object.entries(this.state.users).forEach((kv) => {
            const [id, user] = kv;
            user.priority = parseInt(user.priority, 10);
            this.props.saveUser(id, user);
        });
    }

    removeStudentRole() {
        let state = this.state;
        Object.entries(this.state.users).forEach((kv) => {
            const [id, user] = kv;
            let user_type = user.user_type.slice();
            const index = user.user_type.indexOf("student");
            if (index !== -1) {user_type.splice(index, 1)}
            const newUser = update(user, {$merge: {user_type}});
            state = update(state, {
                users: {$merge: {[id]: newUser}}
            });
        });
        this.setState(state);
    }

    updateUser(key, user, id) {
        return event => {
            const newUser = update(user, {$merge: {[key]: event.target.value}});
            this.setState(update(this.state, {
                users: {$merge: {[id]: newUser}}
            }));
        }
    }

    renderRoleDropdown(user) {
        return Object.values(userRoles).map(role => 
            <MenuItem eventKey={role} key={role}>
                <input
                    type="checkbox"
                    checked={user.user_type.includes(role)}
                    readOnly={true}
                    className="dropdown_checkbox_padding"
                />
                {role}
            </MenuItem>
        );
    }

    renderRoleDropdownTitle(user) {
        return (
            <div>
                <div className="no_overflow">
                    {user.user_type.join(", ") || "No roles"}
                </div>
                <div className="caret pull-right"></div>
            </div>
        );
    }

    renderUserList() {
        return Object.entries(this.state.users).map((kv) => {
            const [id, user] = kv;
            return (
                <div key={id} className="row">
                    <div className="col-sm-3"><input value={user.name} onChange={this.updateUser("name", user, id)} className="form-control"/></div>
                    <div className="col-sm-3"><input value={user.email} onChange={this.updateUser("email", user, id)} type="email" className="form-control"/></div>
                    <div className="col-sm-3"><input value={user.priority} onChange={this.updateUser("priority", user, id)} type="number" className="form-control"/></div>
                    <div className="col-sm-3">
                        <DropdownButton
                            title={this.renderRoleDropdownTitle(user)}
                            noCaret={true}
                            id="template-dropdown"
                            className="form-control"
                            onSelect={role => {
                                let user_type = user.user_type.slice();
                                const index = user.user_type.indexOf(role);
                                if (index === -1) {user_type.push(role)}
                                else {user_type.splice(index, 1)}
                                const newUser = update(user, {$merge: {user_type}});
                                this.setState(update(this.state, {
                                    users: {$merge: {[id]: newUser}}
                                }));
                            }}
                            open={this.state.dropdownOpen === id}
                            onToggle={(isOpen, evt, src) => {
                                if (isOpen) {
                                    this.setState(update(this.state,
                                        {$merge: {dropdownOpen: id}}
                                    ));
                                }
                                else if (src.source === "rootClose") {
                                    this.setState(update(this.state,
                                        {$merge: {dropdownOpen: null}}
                                    ));
                                }
                            }}
                        >
                            {this.renderRoleDropdown(user)}
                        </DropdownButton>
                    </div>
                </div>
            );
        });
    }

    render() {
        const text = this.props.fetching !== 0? `Fetching ${this.props.fetching} users`: "";
        return (
            <div className="container">
                <div className="row">
                    <div className="col-sm-3">Name</div>
                    <div className="col-sm-3">Email Address</div>
                    <div className="col-sm-3">Student Priority</div>
                    <div className="col-sm-3">User Type</div>
                </div>
                {this.renderUserList()}
                <div className="row">
                    <div className="col-sm-4 spacing">
                        <button className="btn btn-primary btn-lg btn-block" onClick={() => this.save()}>Save Changes</button>
                    </div>
                    <div className="col-sm-4"></div>
                    <div className="col-sm-4 spacing">
                        <button className="btn btn-warning btn-lg btn-block" onClick={() => this.removeStudentRole()}>Remove student access</button>
                    </div>
                </div>
                <div className="row spacing">
                    {text}
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return state.users;
};  

const mapDispatchToProps = dispatch => {
    return {
        fetchAllUsers: () => dispatch(fetchAllUsers()),
        saveUser: (id, user) => dispatch(saveUser(id, user))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserEditor);