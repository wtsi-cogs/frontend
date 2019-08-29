/*
Copyright (c) 2019 Genome Research Ltd.

Authors:
 * Josh Holland <jh36@sanger.ac.uk>

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
import {OverlayTrigger, Popover} from 'react-bootstrap';

export default class InfoButton extends Component {
    render() {
        return (
            <OverlayTrigger
                placement={this.props.placement}
                rootClose
                trigger={["click", "hover", "focus"]}
                overlay={
                    <Popover id={this.props.id} title={this.props.title}>
                        {this.props.children}
                    </Popover>
                }
            >
                <a role="button" tabIndex="0">
                    <span className="sr-only">(info)</span>
                    <span className="glyphicon glyphicon-info-sign color-normal" aria-hidden="true"/>
                </a>
            </OverlayTrigger>
        );
    }
}
