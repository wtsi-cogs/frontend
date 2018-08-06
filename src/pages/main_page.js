import React, {Component} from 'react';
import GroupEditor from './group_editor';


class MainPage extends Component {
    async componentDidMount() {
        document.title = "Dashboard";
    }

    render() {
        return (
            <div className="container">
                <h4>Welcome, {this.props.user.data.name}</h4>
                <div className="clearfix"></div>
                {this.props.mostRecentGroup && this.props.user.data.permissions.create_project_groups && <GroupEditor
                    user = {this.props.user}
                    group = {this.props.mostRecentGroup}
                />}
            </div>
        );
    }
}

export default MainPage;