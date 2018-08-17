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
import {
    BrowserRouter as Router,
    Route,
    Switch
  } from 'react-router-dom';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'
import ReactDOM from 'react-dom';
import rootReducer from './reducers/root.js';
import MainPage from './pages/main_page.js';
import DefaultPage from './pages/default_page.js';
import {fetchMe} from './actions/users'
import Header from './header.js';
import { connect } from 'react-redux';
import './index.css';
import {fetchLatestRotation} from './actions/rotations.js';
import Projects from './pages/projects.js';
import MarkableProjects from './pages/markable_projects.js'
import EmailEditor from './pages/email_edit.js';
import UserEditor from './pages/user_edit.js';


const loggerMiddleware = createLogger()
const store = createStore(
    rootReducer,
    applyMiddleware(
      thunkMiddleware // lets us dispatch() functions
      //loggerMiddleware // neat middleware that logs actions
    )
  )

class App extends Component {
    async componentDidMount() {
        store.dispatch(fetchMe());
        store.dispatch(fetchLatestRotation());
    }

    render() {
        if (!(this.props.loggedInID && this.props.latestRotationID)) {return ""}
        return (
            <Provider store={store}>
                <Router>
                    <div>
                        <Header/>
                        <Switch>
                            <Route exact path="/" component={MainPage}/>
                            <Route exact path="/projects" component={Projects}/>
                            <Route exact path="/projects/markable" component={MarkableProjects}/>
                            <Route exact path="/emails/edit" component={EmailEditor}/>
                            <Route exact path="/users/edit" component={UserEditor}/>
                            <Route component={DefaultPage} />
                        </Switch>
                    </div>
                </Router>
            </Provider>
        );
    }
}
    
const mapStateToProps = state => {
    return {
        loggedInID: state.users.loggedInID,
        latestRotationID: state.rotations.latestID
    }
};  

const mapDispatchToProps = dispatch => {return {}};

const ConnectedApp = connect(
    mapStateToProps,
    mapDispatchToProps
)(App)

ReactDOM.render(<ConnectedApp store={store}/>, document.getElementById('root'));
