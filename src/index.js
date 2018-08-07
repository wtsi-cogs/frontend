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
import fetchProjects from './actions/projects'
import fetchMe from './actions/users'
import Header from './header.js';
import api_url from './config.js'
import './index.css';


const loggerMiddleware = createLogger()
const store = createStore(
    rootReducer,
    applyMiddleware(
      thunkMiddleware, // lets us dispatch() functions
      loggerMiddleware // neat middleware that logs actions
    )
  )

class App extends Component {
    constructor() {
        super();
        this.state = {
            loggedInUser: {data: {user_type: [], permissions: {}}, links: {}},
            mostRecentGroup: {data: {}, links: {}}
        };
    }

    async componentDidMount() {
        store.dispatch(fetchProjects(2017, 2));
        store.dispatch(fetchMe());
        const mostRecentGroup = await fetch(api_url+"/api/series/latest");
        const mostRecentGroupJson = await mostRecentGroup.json();

        this.setState({ mostRecentGroup: mostRecentGroupJson
        });
    }

    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div>
                        <Header
                            loggedInUser={this.state.loggedInUser}
                            mostRecentGroup={this.state.mostRecentGroup}
                        />
                        <Switch>
                            <Route exact path="/"
                                render={(props)=>
                                    <MainPage
                                        user={this.state.loggedInUser}
                                        mostRecentGroup={this.state.mostRecentGroup}
                                        location={props.location}
                                    />
                                }
                            />
                            <Route component={DefaultPage} />
                        </Switch>
                    </div>
                </Router>
            </Provider>
        );
        }
    }

ReactDOM.render(<App />, document.getElementById('root'));
