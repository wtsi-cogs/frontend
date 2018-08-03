import React, {Component} from 'react';
import {
    BrowserRouter as Router,
    Route,
    Switch
  } from 'react-router-dom';
import ReactDOM from 'react-dom';
import MainPage from './pages/main_page.js';
import DefaultPage from './pages/default_page.js';
import Header from './header.js';
import './index.css';

class App extends Component {
    constructor() {
        super();
        this.state = {
            loggedInUser: {data: {user_type: [], permissions: {}}, links: {}},
            mostRecentGroup: {data: {}, links: {}}
        };
    }

    async componentDidMount() {
        const loggedInUser = await fetch("http://127.0.0.1:5000/api/users/me");
        const loggedInUserJson = await loggedInUser.json();
        const mostRecentGroup = await fetch("http://127.0.0.1:5000/api/series/latest");
        const mostRecentGroupJson = await mostRecentGroup.json();

        this.setState({ loggedInUser: loggedInUserJson,
                        mostRecentGroup: mostRecentGroupJson
        });
    }

    render() {
        return (
            <div>
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
            </div>
        );
        }
    }

ReactDOM.render(<App />, document.getElementById('root'));
