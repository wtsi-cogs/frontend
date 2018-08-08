import React, {Component} from 'react';
import {Navbar, Nav, NavItem} from 'react-bootstrap';
import { connect } from 'react-redux';
import moment from 'moment';
import { withRouter } from 'react-router-dom';



class Header extends Component {
    getActiveKey() {
        return this.props.location.pathname;
    }

    renderLink(link, name, do_render) {
        if (!do_render) return;
        return (
            <NavItem eventKey={link}>{name}</NavItem>
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
                {this.renderLink("/projects/markable", "My Markable Projects", permissions.create_projects || permissions.review_other_projects)}
                {this.renderLink("/projects", "All Projects", permissions.view_projects_predeadline || rotation.student_viewable)}
                {this.renderLink("/projects/upload", "Upload final project", user.can_upload_project)}
            </Nav>
        );
    }

    renderRightNav() {
        const user = this.props.user;
        const rotation = this.props.rotation;
        if (user === null || rotation === null) {
            return "";
        }
        const permissions = user.permissions;
        const studentChoicePassed = moment.utc(rotation.deadlines.student_choice.value).valueOf() - moment.utc() < 0;
        return (
            <Nav pullRight={true} activeKey={this.getActiveKey()}>
                {this.renderLink("/choices/view", "View Student Choices", permissions.set_readonly && rotation.student_choosable)}
                {this.renderLink("/choices/finalise", "Finalise Student Choices", permissions.set_readonly && rotation.can_finalise)}
                {this.renderLink("/rotations/create", "Create Rotation", permissions.create_project_groups && studentChoicePassed)}
                {this.renderLink("/emails/edit", "Edit Email Templates", permissions.modify_permissions)}
                {this.renderLink("/users/edit", "Edit Users", permissions.modify_permissions)}
                {this.renderLink("/login", "Login", !user)}
            </Nav>
        );
    }

    render() {
        return (
            <Navbar staticTop={true} fluid={true} collapseOnSelect={true} onSelect={(eventKey, event) => {
                    this.props.history.push(eventKey);
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
    if (state.users.loggedInID === null || state.rotations.latestID === null) {
        return {
            user: null,
            rotation: null
        }
    }
    return {
        user: state.users.users[state.users.loggedInID].data,
        rotation: state.rotations.rotations[state.rotations.latestID].data
    }
};  
const mapDispatchToProps = dispatch => {return {}};

export default withRouter(connect(
    mapStateToProps,
    mapDispatchToProps
)(Header));