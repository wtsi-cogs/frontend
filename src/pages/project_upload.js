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
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone'
import Alert from 'react-s-alert';
import {getCurrentStudentProject} from '../actions/users';
import {fetchRotationFromURL} from '../actions/rotations';
import {uploadProject, getProjectFileStatus} from '../actions/projects';
import {submissionGraceTime, maxFilesize} from '../constants';
import update from 'immutability-helper';
import JSZip from 'jszip';
import {api_url} from '../config.js';
import './project_upload.css';

class ProjectUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            uploads: [],
            required: 0,
            canUpload: ""
        }
    }
    
    async componentDidMount() {
        document.title = "Upload Final Project";
        this.props.getCurrentStudentProject(this.props.user);
        this.setState({
            uploads: [],
            required: 0,
            canUpload: ""
        });
    }

    async componentDidUpdate() {
        const projectAll = this.props.projects[this.props.user.data.current_student_project];
        if (projectAll) {
            const rotation = this.props.rotations[projectAll.data.group_id];
            if (!rotation) {
                this.props.fetchRotationFromURL(projectAll.links.group);
            }
            const status = this.props.projectStatus[projectAll.data.id];
            if (!status && projectAll.data.uploaded) {
                this.props.getProjectFileStatus(projectAll.data.id);
            }
            if (this.state.canUpload === "") {
                this.setState(update(this.state, {$merge: {
                    canUpload: !projectAll.data.uploaded
                }}));
            }
            else if (rotation && this.state.required === 0) {
                this.setState(update(this.state, {$merge: {
                    required: rotation.data.part === 2? 2: 1
                }}));
            }
        }
    }

    onSuccessfulUpload() {
        this.setState(update(this.state, {$merge: {
            canUpload: false,
            uploads: []
        }}));
    }

    upload() {
        const projectID = this.props.user.data.current_student_project;
        var zip = new JSZip();
        this.state.uploads.forEach(file => {
            zip.file(file.name, file);
        });
        zip.generateAsync({type:"blob"}).then(blob => {
            if (blob.size > maxFilesize) {
                Alert.error("Selected file(s) too large");
            }
            else {
                this.props.uploadProject(projectID, blob, (status_message) => {
                    if (status_message === "success" || !status_message) {
                        Alert.success(`Successfully uploaded your files for ${this.props.projects[projectID].data.title}.`);
                        this.onSuccessfulUpload();
                    }
                    else {
                        Alert.error(`Error when uploading ${this.props.projects[projectID].data.title}: ${status_message}`);
                    }
                });
            }
        });
    }

    onDrop(accept, reject) {
        const noRequired = this.state.required;
        this.setState(update(this.state, {$merge: {
            uploads: this.state.uploads.concat(accept)
        }}), () => {
            if (this.state.uploads.length > noRequired) {
                Alert.error("Too many files.");
                this.setState(update(this.state, {$merge: {
                    uploads: []
                }}));
            }
            else if (this.state.uploads.length < noRequired) {
                Alert.info(`Still need ${noRequired - this.state.uploads.length} file(s).`);
            }
        });
    }

    renderToUpload(group) {
        const deadline = `${group.deadlines.student_complete.value} 23:59`;
        return (
            <div>
                <h5>Deadline: {deadline}</h5>
                <p>
                    You may submit your final document for the project at any time.
                    {group.part !== 2 && ` You will receive ${submissionGraceTime} grace period where you can edit your final upload as you please. `}
                    {group.part === 2 && ` You may edit your final upload until the final deadline of ${deadline}. `}
                    After this time, you will no longer be able to modify the project at all and it will be sent to your supervisor and dedicated CoGS marker.
                    You will be then sent your grade for the project by email along with accompanying feedback.
                </p>
            </div>
        );
    }

    renderUploaded() {
        const projectID = this.props.user.data.current_student_project
        const projectStatus = this.props.projectStatus[projectID];
        const projectFiles = projectStatus? projectStatus.data.file_names: [];
        return (
            <div>
                <input
                    type="checkbox" 
                    value={this.state.canUpload}
                    onClick={() => {this.setState(update(this.state, {$toggle: ["canUpload"]}))}}
                    readOnly={true}
                    id="upload-checkbox"
                />
                <label htmlFor="upload-checkbox">
                    Overwrite existing data
                </label>
                <hr/>
                <ol>
                    {projectFiles.map((fileName, i) => {
                        return (
                            <li key={i}>{fileName}</li>
                        );
                    })}
                </ol>
            </div>
        );
    }

    render() {
        const projectAll = this.props.projects[this.props.user.data.current_student_project];
        if (!projectAll) {
            return null;
        }
        const project = projectAll.data;

        const projectStatus = this.props.projectStatus[project.id];
        const projectGrace = projectStatus? projectStatus.data.grace_time: "Loading deadline";

        const groupAll = this.props.rotations[project.group_id];
        if (!groupAll) {
            return null;
        }
        const group = groupAll.data;

        return (
            <div className="container">
                <h4>Upload final document for {project.title}</h4>
                {!project.uploaded && this.renderToUpload(group)}
                {group.part === 2 && 
                    <p>
                        When the deadline is reached, your project will be sent to the grad office, your supervisor and dedicated CoGS marker.
                        It is your own responsibility to send it to reprographics to have it printed.
                    </p>
                }
                {project.uploaded && 
                    <p>
                        You have already uploaded your final document for this rotation.
                        You may reupload the project until <b>{projectGrace}</b>.<br/>
                        You may download what you have currently submitted <a href={`${api_url}/api/projects/${project.id}/file`}>here</a>.
                        You do not need to take any more action unless you wish to resubmit.
                    </p>
                }
                <Dropzone
                    onDrop={(accept, reject) => this.onDrop(accept, reject)}
                    style={{
                        position: "relative",
                        width: "100%",
                        height: "200px",
                        borderWidth: "2px",
                        borderColor: "rgb(102, 102, 102)",
                        borderStyle: "dashed",
                        borderRadius: "5px",
                        margin: "20px",
                        padding: "20px"
                    }}
                    disabledStyle={this.state.canUpload? 
                    {
                        background: "linear-gradient(rgb(218, 255, 218) 0px, rgb(120, 195, 120) 100%)",
                        color: "#000"
                    } : 
                    {
                        background: "rgb(206, 206, 206)",
                    }}
                    disabled={this.state.required === this.state.uploads.length || !this.state.canUpload}
                >
                    {this.state.canUpload && 
                        <div>
                            {this.state.required !== this.state.uploads.length && (
                                <p>
                                    Click here to upload files.
                                </p>
                            )}
                            <p>
                                Required files: {this.state.required}
                            </p>
                            <hr/>
                            <ol>
                                {this.state.uploads.map((file,i) => {
                                    return (
                                        <li key={i}>{file.name}</li>
                                    );
                                })}
                            </ol>
                        </div>
                    }
                    {!this.state.canUpload && this.renderUploaded()}
                </Dropzone>
                <button
                    type="button"
                    className="btn btn-success btn-lg button-padding"
                    disabled={this.state.required !== this.state.uploads.length}
                    onClick={()=>this.upload()}
                >
                    Upload
                </button>
                <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    disabled={this.state.uploads.length === 0}
                    onClick={()=>{
                        this.setState(update(this.state, {$merge: {
                            uploads: []
                        }}));
                    }}
                >
                    Clear
                </button>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        user: state.users.users[state.users.loggedInID],
        rotations: state.rotations.rotations,
        projects: state.projects.projects,
        projectStatus: state.projects.projectStatus
    }
};  

const mapDispatchToProps = dispatch => {
    return {
        getCurrentStudentProject: (user) => dispatch(getCurrentStudentProject(user)),
        fetchRotationFromURL: (url) => dispatch(fetchRotationFromURL(url)),
        uploadProject: (projectID, blob, callback) => dispatch(uploadProject(projectID, blob, callback)),
        getProjectFileStatus: (projectID) => dispatch(getProjectFileStatus(projectID))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectUpload);
