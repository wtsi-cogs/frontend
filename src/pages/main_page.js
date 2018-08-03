import React, {Component} from 'react';
import GroupEditForm from '../components/group_edit_form';


class MainPage extends Component {
    async componentDidMount() {
        document.title = "Dashboard";
    }

    render() {
        return (
            <div className="container">
                <h4>Welcome, {this.props.user.data.name}</h4>
                <div className="clearfix"></div>
                {this.props.user.data.permissions.create_project_groups && <GroupEditForm group={this.props.mostRecentGroup} submitName = "Edit Group"/>}
            </div>
        );
    }
}

export default MainPage;