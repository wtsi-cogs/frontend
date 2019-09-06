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

// A dropdown menu with checkboxes allowing multiple items to be
// selected.
//
// Props:
// - items
// - noneSelectedText
// - onSelect
class MultiselectDropDown extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false
        };
    }

    // Render all items in the dropdown.
    renderItems() {
        return Object.entries(this.props.items).map(([key, value]) => 
            <MenuItem eventKey={key} key={key}>
                <input
                    type="checkbox"
                    checked={value}
                    readOnly={true}
                    className="dropdown_checkbox_padding"
                    // FIXME: this is an atrocious hack!
                    // This works around an issue where, if you clicked on the
                    // checkbox (instead of on the rest of the MenuItem), the
                    // state of the checkbox wouldn't visually update.
                    onChange={() => setTimeout(() => this.forceUpdate())}
                />
                {key}
            </MenuItem>
        );
    }

    // Render the text displayed in the dropdown button itself.
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
