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
import './index.css';
import {fetchLatestRotation} from './actions/rotations.js';


const loggerMiddleware = createLogger()
const store = createStore(
    rootReducer,
    applyMiddleware(
      thunkMiddleware, // lets us dispatch() functions
      loggerMiddleware // neat middleware that logs actions
    )
  )

class App extends Component {
    async componentDidMount() {
        store.dispatch(fetchProjects(2017, 2));
        store.dispatch(fetchMe());
        store.dispatch(fetchLatestRotation());
    }

    render() {
        return (
            <Provider store={store}>
                <Router>
                    <div>
                        <Header/>
                        <Switch>
                            <Route exact path="/"
                                render={(props)=>
                                    <MainPage location={props.location}/>
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

ReactDOM.render(<App/>, document.getElementById('root'));
