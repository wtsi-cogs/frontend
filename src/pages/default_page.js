import React, {Component} from 'react';


class DefaultPage extends Component {
    async componentDidMount() {
        document.title = "404 - Not Found";
    }

    render() {
        return (
            <div className="container">
                <h4>404 - Page Not Found</h4> 
            </div>
        );
    }
}

export default DefaultPage;