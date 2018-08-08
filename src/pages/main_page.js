import React, {Component} from 'react';
import GroupEditor from './group_editor';
import { connect } from 'react-redux';
import {saveRotation} from '../actions/rotations';


class MainPage extends Component {
    async componentDidMount() {
        document.title = "Dashboard";
    }

    render() {
        if (this.props.user === null) {
            return "";
        }
        return (
            <div className="container">
                <h4>Welcome, {this.props.user.name}</h4>
                <div className="clearfix"></div>
                {this.props.rotation && this.props.user.permissions.create_project_groups && <GroupEditor
                    user = {this.props.user}
                    group = {this.props.rotation}
                    onSave = {this.props.saveRotation}
                />}
            </div>
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
        rotation: state.rotations.rotations[state.rotations.latestID]
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        saveRotation: rotation => dispatch(saveRotation(rotation)) 
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(MainPage);