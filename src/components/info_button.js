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

// A Glyphicon "(i)" icon, which displays a popup containing its
// children on focus, hover or click.
//
// Props:
// - id: a unique (per page) ID to use for a11y purposes
// - placement: where to display the popover ("top", "bottom", "left",
//   or "right")
// - title: displayed in bold at the top of the popover, if present
//
// TODO: it would be lovely to modify react-bootstrap to make this less
// bad. In particular, the popover currently vanishes on mouseout,
// regardless of how it was shown (e.g. focus or click) -- it would be
// nice to distinguish between these, so that mouseout only removes a
// popover shown because of mouuseover, and a click elsewhere is
// required to remove a popover shown because of a click.
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
