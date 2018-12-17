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


import React from 'react';
import { confirmAlert } from 'react-confirm-alert';

import "./styledAlert.css";

export default function styledAlert(args) {
    confirmAlert({
        customUI: ({onClose}) => {
            return (
                <div className='react-confirm-alert-body'>
                    <h2>{args.title}</h2>
                    {args.message}
                    <div>
                        {args.buttons.map((button, i) => (
                            <button
                                className="btn btn-primary btn-md style-button"
                                key={i}
                                onClick={() => {
                                    button.onClick();
                                    onClose();
                                }}
                            >
                                {button.label}
                            </button>
                        ))}
                    </div>
                </div>
            );
        }
    })
}