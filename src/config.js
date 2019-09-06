// These variables are substituted at build time, since the app compiles
// down to static HTML and JS.
export const api_url = process.env.REACT_APP_API_URL;
export const developer = process.env.REACT_APP_DEVELOPER === "true";
