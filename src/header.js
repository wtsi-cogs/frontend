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
import {Navbar, Nav, NavItem, NavDropdown, MenuItem} from 'react-bootstrap';
import { connect } from 'react-redux';
import moment from 'moment';
import { withRouter } from 'react-router-dom';
import {fetchRotationYears} from './actions/rotations'
import {api_url} from './config.js';
import "./header.css"


class Header extends Component {
    async componentDidMount() {
        if (this.props.user.permissions.view_all_submitted_projects && !this.props.rotationYears.length) {
            this.props.fetchRotationYears();
        }
    }

    getActiveKey() {
        return this.props.location.pathname;
    }

    renderLink(link, name, do_render, key=undefined) {
        if (!do_render) return;
        return (
            <NavItem eventKey={link} key={key}>{name}</NavItem>
        );
    }

    renderLeftNav() {
        const user = this.props.user;
        const rotation = this.props.rotation;
        if (user === null || rotation === null) {
            return "";
        }
        const permissions = user.permissions;
        return (
            <Nav activeKey={this.getActiveKey()}>
                {this.renderLink("/", "Home", true)}
                {this.renderLink("/projects/create", "Create Project", permissions.create_projects && !rotation.read_only)}
                {this.renderLink("/projects", "All Projects", permissions.view_projects_predeadline || rotation.student_viewable)}
                {this.renderLink("/projects/upload", "Upload final project", user.can_upload_project)}
            </Nav>
        );
    }

    renderCogsEdit(max) {
        return [...Array(max).keys()].map(i => {
            return this.renderLink(`/rotations/${i+1}/cogs`, `Rotation ${i+1}`, true, i);
        });
    }

    excelExport() {
        return this.props.rotationYears.map(year => {
            return <MenuItem href={`${api_url}/api/series/${year}/export.xlsx`} key={year}>{year}</MenuItem>;
        });
    }

    renderRightNav() {
        const user = this.props.user;
        const rotation = this.props.rotation;
        if (user === null || rotation === null) {
            return "";
        }
        const permissions = user.permissions;
        const studentChoicePassed = moment.utc(rotation.deadlines.student_choice.value).add(1, 'days').valueOf() - moment.utc() < 0;
        return (
            <Nav pullRight={true} activeKey={this.getActiveKey()}>
                {this.renderLink("/rotations/choices/view", "View Student Choices", permissions.set_readonly && rotation.student_choosable)}
                {this.renderLink("/rotations/choices/finalise", "Finalise Student Choices", permissions.set_readonly && rotation.can_finalise)}
                {this.renderLink("/rotations/create", "Create Rotation", permissions.create_project_groups && studentChoicePassed)}
                {permissions.view_all_submitted_projects && 
                    <NavDropdown title="Edit CoGS Markers" id="navbar_cogs_marker_dropdown" eventKey="cogs_dropdown">
                        {this.renderCogsEdit(rotation.part)}
                    </NavDropdown>
                }
                {permissions.view_all_submitted_projects && 
                    <NavDropdown title="Export to Excel" id="navbar_excel_dropdown" eventKey="excel_dropdown">
                        {this.excelExport()}
                    </NavDropdown>
                }
                {this.renderLink("/emails/edit", "Edit Email Templates", permissions.modify_permissions)}
                {this.renderLink("/users/edit", "Edit Users", permissions.modify_permissions)}
                {this.renderLink("/login", "Login", !user)}
                {this.renderLink("/logout", "Logout", user)}
            </Nav>
        );
    }

    render() {
        return (
            <Navbar staticTop={true} fluid={true} collapseOnSelect={true} onSelect={(eventKey, event) => {
                if (["/login", "/logout"].includes(eventKey)) {
                    window.location = eventKey;
                }
                else {
                    this.props.history.push(eventKey);
                }
            }}>
                <Navbar.Header>
                    <Navbar.Brand>
                        PhD Student Portal
                    </Navbar.Brand>
                    <Navbar.Toggle/>
                </Navbar.Header>
                <Navbar.Collapse>
                    {this.renderLeftNav()}
                    {this.renderRightNav()}
                </Navbar.Collapse>
            </Navbar>
        );
    }
}


const mapStateToProps = state => {
    return {
        user: state.users.users[state.users.loggedInID].data,
        rotation: state.rotations.rotations[state.rotations.latestID].data,
        rotationYears: state.rotations.yearList
    }
};  
const mapDispatchToProps = dispatch => {
    return {
        fetchRotationYears: () => dispatch(fetchRotationYears())
    }
};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Header));