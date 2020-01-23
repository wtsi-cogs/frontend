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
import {fetchRotationFromURL} from '../actions/rotations';
import {uploadProject, getProjectFileStatus, fetchProject} from '../actions/projects';
import {maxFilesize} from '../constants';
import update from 'immutability-helper';
import JSZip from 'jszip';
import {renderDownload} from '../pages/project_download';
import './project_upload.css';

// Page for uploading project reports. Accessible to students and the
// Graduate Office.
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
        this.props.fetchProject(this.props.match.params.projectID);
        this.setState({
            uploads: [],
            required: 0,
            canUpload: ""
        });
    }

    async componentDidUpdate() {
        const projectAll = this.props.projects[this.props.match.params.projectID];
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
                this.setState({
                    canUpload: !projectAll.data.uploaded
                });
            }
            else if (rotation && this.state.required === 0) {
                this.setState({
                    required: rotation.data.part === 2? 2: 1
                });
            }
        }
    }

    // TODO: why is this factored out? It's used in exactly one place.
    onSuccessfulUpload() {
        this.setState({
            canUpload: false,
            uploads: []
        });
    }

    // Zip up the selected files, check that the zip isn't too large
    // before trying to upload it, and then upload it.
    upload() {
        const projectID = this.props.match.params.projectID;
        const numFiles = this.state.uploads.length;
        var zip = new JSZip();
        this.state.uploads.forEach(file => {
            zip.file(file.name, file);
        });
        zip.generateAsync({type:"blob"}).catch(error => {
            if (error instanceof DOMException){
                // XXX: when trying to read from a File that represents a
                // directory, Chrome 76 raises NotFoundError, and Firefox 67
                // raises NotReadableError. However, if the File represents a
                // file which has been removed since it was selected, both
                // Firefox and Chrome raise NotFoundError!
                if (error.name === "NotReadableError") {
                    throw new Error("Couldn't read file (directory uploads are not supported)");
                } else if (error.name === "NotFoundError") {
                    throw new Error("File not found (directory uploads are not supported)");
                }
            }
            throw error;   
            
        }).then(blob => {
            if (blob.size > maxFilesize) {
                throw new Error(`Selected file${numFiles === 1 ? '' : 's'} too large`);
            }
            return this.props.uploadProject(projectID, blob);
        }).then(status_message => {
                    if (status_message === "success" || !status_message) {
                        Alert.success(`Successfully uploaded your files for ${this.props.projects[projectID].data.title}.`);
                        this.onSuccessfulUpload();
                    }
                    else {
                        throw new Error(status_message);
                    }
                }, error => {
                    Alert.error(`Error when uploading project: ${error.message}`);
            });
            
    }
    

    // Add a file to the list of files to upload (the name is because as
    // well as clicking to select a file, you can drag and drop files
    // into the "dropzone").
    onDrop(accept, reject) {
        const noRequired = this.state.required;
        this.setState((state, props) => ({
            uploads: state.uploads.concat(accept)
        }), () => {
            const filesLeft = noRequired - this.state.uploads.length;
            if (filesLeft < 0) {
                Alert.error("Too many files.");
                this.setState({
                    uploads: []
                });
            }
            else if (filesLeft > 0) {
                Alert.info(`Still need ${filesLeft} file${filesLeft === 1 ? '' : 's'}.`);
            }
        });
    }

    // Render text displayed before any files have been uploaded.
    renderToUpload(group) {
        const deadline = `${group.deadlines.student_complete.value} 23:59`;
        return (
            <div>
                <h5>Deadline: {deadline}</h5>
                <p>
                    You may submit your final document for the project at any time, and you may resubmit as many times as you like until the final deadline of {deadline}. After this time, you will no longer be able to modify the project at all, and it will be sent to your supervisor and dedicated CoGS marker. You will be then sent your grade for the project by email along with accompanying feedback.
                </p>
            </div>
        );
    }

    // Render text displayed when no files have been selected, and some
    // files have already been uploaded previously.
    renderUploaded() {
        const projectID = this.props.match.params.projectID;
        const projectStatus = this.props.projectStatus[projectID];
        const projectFiles = projectStatus? projectStatus.data.file_names: [];
        return (
            <div>
                <input
                    type="checkbox" 
                    value={this.state.canUpload}
                    onClick={() => {this.setState((state, props) => update(state, {
                        $toggle: ["canUpload"]
                    }))}}
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
        const projectAll = this.props.projects[this.props.match.params.projectID];
        if (!projectAll) {
            return null;
        }
        const project = projectAll.data;

        if (project.grace_passed) {
            return (
                <div className="container">
                    <p>
                        The grace time to upload this project has expired. You may no longer edit your submission.
                    </p>
                </div>
            );
        }

        const projectStatus = this.props.projectStatus[project.id];
        const projectGrace = projectStatus? projectStatus.data.grace_time || "unknown" : "(loading deadline)";

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
                        When the deadline is reached, your project will be sent to the Graduate Office, your supervisor and dedicated CoGS marker. It is your own responsibility to send it to reprographics to have it printed.
                    </p>
                }
                {project.uploaded &&
                    <p>
                        You have already uploaded your final document for this rotation. You may reupload your project until <b>{projectGrace}</b>. You may download what you have currently submitted {renderDownload(projectAll, "here")}.
                    </p>
                }
                {project.uploaded &&
                    <p>
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
                        this.setState({
                            uploads: []
                        });
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
        fetchProject: (projectID) => dispatch(fetchProject(projectID)),
        fetchRotationFromURL: (url) => dispatch(fetchRotationFromURL(url)),
        uploadProject: (projectID, blob, callback) => dispatch(uploadProject(projectID, blob, callback)),
        getProjectFileStatus: (projectID) => dispatch(getProjectFileStatus(projectID))
    }
};

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ProjectUpload);
