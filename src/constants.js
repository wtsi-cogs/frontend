// Used inconsistently to avoid potential typos in role names.
// It would be better to use strict typing to avoid this problem (see
// the `flow` branch, though it's now very behind master).
export const cogsMember = "cogs_member"
export const gradOffice = "grad_office"
export const student = "student"
export const supervisor = "supervisor"
export const archive = "archive"
export const userRoles = [cogsMember, gradOffice, student, supervisor, archive]

// Likewise, used occasionally to avoid typos.
export const modifyPermissions = "modify_permissions"
export const createProjectGroups = "create_project_groups"
export const setReadonly = "set_readonly"
export const createProjects = "create_projects"
export const reviewOtherProjects = "review_other_projects"
export const joinProjects = "join_projects"
export const viewProjectsPredeadline = "view_projects_predeadline"
export const viewAllSubmittedProjects = "view_all_submitted_projects"
export const userPermissions = [modifyPermissions, createProjectGroups, setReadonly, createProjects, reviewOtherProjects, joinProjects, viewProjectsPredeadline, viewAllSubmittedProjects]

// Used to filter the big list of projects.
// Taken from <https://www.sanger.ac.uk/science/programmes>.
// Theoretically is meant to be in sync with the equivalent list on the
// backend, but it hasn't been for some time.
export const programmes = [
    "Cancer, Ageing and Somatic Mutation",
    "Cellular Genetics",
    "Human Genetics",
    "Parasites and Microbes",
    "Tree of Life",
]

// Used in the GroupEditor, in developer mode (to allow modifying the
// rotation state via the UI), and possibly when not in developer mode
// as well, somewhere.
export const groupAttrs = [
    "student_viewable",
    "student_choosable",
    "student_uploadable",
    "can_finalise",
    "read_only"
]

// See #25.
export const grades = {
    A: "Excellent",
    B: "Good",
    C: "Satisfactory",
    D: "Fail"
}

// The maximum size (in bytes) of the uploaded file.
// (This might be the total size of the uploaded files, or the size of
// the constructed zip file -- in any case, the backend checks the size
// of the received file.)
// See #25.
export const maxFilesize = 31457280
