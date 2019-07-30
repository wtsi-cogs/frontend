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



import {DropdownButton, MenuItem} from 'react-bootstrap';
import './multiselect_dropdown.css';

class MultiselectDropDown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }

    renderItems() {
        return Object.entries(this.props.items).map(([key, value]) => 
            <MenuItem eventKey={key} key={key}>
                <input
                    type="checkbox"
                    checked={value}
                    readOnly={true}
                    className="dropdown_checkbox_padding"
                />
                {key}
            </MenuItem>
        );
    }

    renderTitle() {
        return (
            <div>
                <div className="no_overflow">
                    {Object.entries(this.props.items)
                        .filter(([k,v])=>v)
                        .map(([k,v])=>k)
                        .join(", ") || this.props.noneSelectedText}
                </div>
                <div className="caret dropdown-caret pull-right"></div>
            </div>
        );
    }

    render() {
        return (
            <DropdownButton
                title={this.renderTitle()}
                noCaret={true}
                id="template-dropdown"
                className="form-control"
                onSelect={this.props.onSelect}
                open={this.state.isOpen}
                onToggle={(isOpen, evt, src) => {
                    if (isOpen) {
                        this.setState({isOpen: true});
                    }
                    else if (src.source === "rootClose") {
                        this.setState({isOpen: false});
                    }
                }}
            >
                {this.renderItems()}
            </DropdownButton>
        );
    }
}


export default MultiselectDropDown;
