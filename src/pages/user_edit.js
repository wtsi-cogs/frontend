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
import Alert from 'react-s-alert';
import shallowEqualObjects from 'shallow-equal/objects';
import {userRoles, archive} from '../config.js';
import MultiselectDropDown from '../components/multiselect_dropdown';
import update from 'immutability-helper';
import {fetchAllUsers, saveUser, createUser} from '../actions/users';
import './user_edit.css';

const userDefault = {
    name: "",
    email: "",
    email_personal: "",
    priority: 0,
    user_type: []
}

class UserEditor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            users: {},
            newUsers: {},
            dropdownOpen: null,
            filter: userRoles.reduce((map, role) => {map[role] = true; return map}, {}),
            showNoRoles: false
        }
    }

    async componentDidMount() {
        document.title = "User Editor";
        this.props.fetchAllUsers();
    }

    async componentDidUpdate() {
        Object.values(this.props.users).forEach(user => {
            if (!this.state.users.hasOwnProperty(user.data.id)) {
                this.setState(update(this.state, {
                    users: {$merge: this.loadUserStruct(user)}
                }));
            }
        });
        Object.entries(this.state.newUsers).forEach((kv) => {
            const [id, user] = kv;
            if (shallowEqualObjects(user, userDefault)) {
                this.setState(update(this.state, {
                    newUsers: {$unset: [id]}
                }));
            }
        });
    }

    loadUserStruct(user) {
        return {
            [user.data.id]: {
                name: user.data.name,
                email: user.data.email,
                email_personal: user.data.email_personal,
                priority: user.data.priority,
                user_type: user.data.user_type
            }
        }
    }

    save() {
        Object.entries(this.state.users).forEach((kv) => {
            const [id, user] = kv;
            user.priority = parseInt(user.priority, 10);
            this.props.saveUser(id, user);
        });
        Object.values(this.state.newUsers).forEach(user => {
            user.priority = parseInt(user.priority, 10);
            this.props.createUser(user);
        });
        this.setState(update(this.state, {
            newUsers: {$set: {}}
        }));
        Alert.info("Changes saved");
    }

    cancel() {
        this.setState(update(this.state, {
            users: {$set: 
                Object.keys(this.props.users).reduce((map, userID) => {
                    map[userID] = this.loadUserStruct(this.props.users[userID])[userID];
                    return map;
                }, {})},
            newUsers: {$set: {}}
        }));
    }

    archiveUsers() {
        let state = this.state;
        Object.entries(this.state.users).filter(kv => this.shouldUserBeShown(kv)).forEach((kv) => {
            const [id, user] = kv;
            const newUser = update(user, {$merge: {user_type: [archive]}});
            state = update(state, {
                users: {$merge: {[id]: newUser}}
            });
        });
        this.setState(state);
    }

    shouldUserBeShown(kv) {
        const id = kv[0];
        const propsUser = this.props.users[id];
        const propsRoles = propsUser.data.user_type;
        if (!this.state.showNoRoles && !propsRoles.length) {
            return false;
        }
        const rolesShown = Object.entries(this.state.filter).filter(kv => kv[1]).map(kv => kv[0]);
        return rolesShown.some(role => {
            return propsRoles.includes(role);
        });
    }

    renderUser(id, user, stateVar) {
        const updateUser = (key, user, id) => {
            return event => {
                const newUser = update(user, {$merge: {[key]: event.target.value}});
                this.setState(update(this.state, {
                    [stateVar]: {$merge: {[id]: newUser}}
                }));
            }
        }
        return (
            <div key={id} className="row">
                <div className="col-xs-3"><input value={user.name || ""} onChange={updateUser("name", user, id)} className="form-control" placeholder="Name"/></div>
                <div className="col-xs-2"><input value={user.email || ""} onChange={updateUser("email", user, id)} type="email" className="form-control" placeholder="Email"/></div>
                <div className="col-xs-2"><input value={user.email_personal || ""} onChange={updateUser("email_personal", user, id)} type="email" className="form-control"/></div>
                <div className="col-xs-2"><input value={user.priority || ""} onChange={updateUser("priority", user, id)} type="number" className="form-control" placeholder="Student Priority"/></div>
                <div className="col-xs-3">
                    <MultiselectDropDown
                        items = {userRoles.reduce((map, role) => {map[role] = user.user_type.includes(role); return map}, {})}
                        noneSelectedText = "No roles"
                        onSelect = {role => {
                            let user_type = user.user_type.slice();
                            const index = user.user_type.indexOf(role);
                            if (index === -1) {user_type.push(role)}
                            else {user_type.splice(index, 1)}
                            const newUser = update(user, {$merge: {user_type}});
                            this.setState(update(this.state, {
                                [stateVar]: {$merge: {[id]: newUser}}
                            }));
                        }}
                    />
                </div>
            </div>
        );
    }

    renderUserList() {
        return Object.entries(this.state.users).filter(user => this.shouldUserBeShown(user)).map((kv) => {
            const [id, user] = kv;
            return this.renderUser(id, user, "users");
        });
    }

    renderNewUser(i) {
        return this.renderUser(i, userDefault, "newUsers");
    }

    renderFilterOptions() {
        return (
            <div className="col-xs-12">
                {userRoles.map(role => {
                    return (
                        <label key={role} className="btn">
                            <input 
                                type="checkbox"
                                className="role-check"
                                checked={this.state.filter[role]}
                                readOnly={true}
                                onClick={() => {
                                    this.setState(update(this.state, {filter: {$toggle: [role]}}));
                                }}
                            />
                            {role}
                        </label>
                    );
                })}
            </div>
        );
    }

    render() {
        const text = this.props.fetching !== 0? `Fetching ${this.props.fetching} users`: "";
        const noRoleText = this.state.showNoRoles? "Hide users with no roles": "Show users with no roles";
        return (
            <div className="container">
                {this.renderFilterOptions()}
                <div className="row">
                    <div className="col-xs-3">Name</div>
                    <div className="col-xs-2">Email Address</div>
                    <div className="col-xs-2">Personal Email</div>
                    <div className="col-xs-2">Student Priority</div>
                    <div className="col-xs-3">User Type</div>
                </div>
                {this.renderUserList()}
                {[...Array(Object.keys(this.state.newUsers).length+1).keys()].map(i => {
                    if (i === Object.keys(this.state.newUsers).length) {
                        return this.renderNewUser(i);
                    }
                    return this.renderUser(i, this.state.newUsers[i], "newUsers");
                })}
                <div className="row">
                    <div className="col-sm-4 spacing">
                        <button className="btn btn-primary btn-lg btn-block" onClick={() => this.save()}>Save Changes</button>
                        <button className="btn btn-primary btn-lg btn-block" onClick={() => this.cancel()}>Cancel Changes</button>
                    </div>
                    <div className="col-sm-4"></div>
                    <div className="col-sm-4 spacing">
                        <button className="btn btn-warning btn-lg btn-block" onClick={() => this.archiveUsers()}>Archive Selected Users</button>
                        <button className="btn btn-primary btn-lg btn-block" onClick={() => {
                            this.setState(update(this.state,
                                {$merge: {showNoRoles: !this.state.showNoRoles}}
                            ));
                        }}>{noRoleText}</button>
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
        saveUser: (id, user) => dispatch(saveUser(id, user)),
        createUser: (user) => dispatch(createUser(user))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(UserEditor);