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
import { createBrowserHistory } from 'history';
import { routerMiddleware, connectRouter, ConnectedRouter } from 'connected-react-router'
import axios from 'axios';

import Alert from 'react-s-alert';
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/stackslide.css';

import './index.css';
import {fetchLatestRotation} from './actions/rotations.js';
import Projects from './pages/projects.js';
import MarkableProjects from './pages/markable_projects.js'
import EmailEditor from './pages/email_edit.js';
import UserEditor from './pages/user_edit.js';
import RotationCreate from './pages/rotation_create.js';
import ProjectCreate from './pages/project_create.js';
import ProjectResubmit from './pages/project_resubmit.js';
import ProjectEdit from './pages/project_edit.js';
import RotationCogsEditor from './pages/rotation_cogs_edit.js';
import RotationChoiceViewer from './pages/rotation_choices_view.js'
import RotationChoiceChooser from './pages/rotation_choices_finalise.js'
import RotationCogsFinalise from './pages/rotation_choices_cogs.js'
import ProjectUpload from './pages/project_upload'
import ProjectMark from './pages/project_mark'
import {ProjectFeedbackSupervisor, ProjectFeedbackCogs} from './pages/project_feedback';

import { authenticate, AUTHENTICATED } from './actions/authenticate';


//const loggerMiddleware = createLogger();
const history = createBrowserHistory();
const store = createStore(
    connectRouter(history)(rootReducer),
    applyMiddleware(
      thunkMiddleware, // lets us dispatch() functions
      routerMiddleware(history) // for dispatching history actions
      //,loggerMiddleware // neat middleware that logs actions
    )
  )

class App extends Component {
    async componentWillMount() {
        store.dispatch(authenticate());
        // Add an alert whenever a request fails.
        axios.interceptors.response.use(undefined, (error) => {
            const resp = error.response;
            let msg = "";
            if (typeof resp.data === 'string') {
                msg = <p>{resp.status}: {resp.statusText}<br/>{resp.data.split("\n").map((line, i) => <span key={i}>{line}<br/></span>)}</p>;
            }
            else {
                msg = <p>{resp.status}: {resp.statusText}<br/>{JSON.stringify(resp.data)}</p>;
            }
            Alert.error(msg, {onClose: () => {
                if (resp.status === 401) {
                    // Should only ever happen with authentication based issues
                    window.location.replace("/login");
                }
            }});
            return Promise.reject(error);
          });
    }
    async componentDidUpdate() {
        if (this.props.authenticate.stage !== AUTHENTICATED) {
            store.dispatch(authenticate());
            return
        }
        if (!this.props.loggedInID) {
            store.dispatch(fetchMe());
        }
        if (!this.props.latestRotationID) {
            store.dispatch(fetchLatestRotation());
        }
    }

    render() {
        if (!(this.props.loggedInID && this.props.latestRotationID)) {
            return (
                <Alert stack={{limit: 3}} effect="stackslide"/>
            );
        }
        return (
            <Provider store={store}>
                <ConnectedRouter history={history}>
                    <div>
                        <Header/>
                        <Switch>
                            <Route exact path="/" component={MainPage}/>
                            <Route exact path="/projects" component={Projects}/>
                            <Route exact path="/projects/markable" component={MarkableProjects}/>
                            <Route exact path="/emails/edit" component={EmailEditor}/>
                            <Route exact path="/people/edit" component={UserEditor}/>
                            <Route exact path="/rotations/create" component={RotationCreate}/>
                            <Route exact path="/projects/create" component={ProjectCreate}/>
                            <Route exact path="/projects/upload" component={ProjectUpload}/>
                            <Route exact path="/projects/:projectID/resubmit" component={ProjectResubmit}/>
                            <Route exact path="/projects/:projectID/edit" component={ProjectEdit}/>
                            <Route exact path="/projects/:projectID/provide_feedback" component={ProjectMark}/>
                            <Route exact path="/projects/:projectID/supervisor_feedback" component={ProjectFeedbackSupervisor}/>
                            <Route exact path="/projects/:projectID/cogs_feedback" component={ProjectFeedbackCogs}/>
                            <Route exact path="/rotations/choices/cogs" component={RotationCogsFinalise}/>
                            <Route exact path="/rotations/choices/view" component={RotationChoiceViewer}/>
                            <Route exact path="/rotations/choices/finalise" component={RotationChoiceChooser}/>
                            <Route exact path="/rotations/:partID/cogs" component={RotationCogsEditor}/>
                            <Route component={DefaultPage} />
                        </Switch>
                        <Alert stack={{limit: 3}} effect="stackslide"/>
                    </div>
                </ConnectedRouter>
            </Provider>
        );
    }
}
    
const mapStateToProps = state => {
    return {
        loggedInID: state.users.loggedInID,
        latestRotationID: state.rotations.latestID,
        authenticate: state.authenticate
    }
};  

const mapDispatchToProps = dispatch => {return {}};

const ConnectedApp = connect(
    mapStateToProps,
    mapDispatchToProps
)(App);

ReactDOM.render(<ConnectedApp store={store}/>, document.getElementById('root'));
