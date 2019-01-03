import {authenticators} from './constants'

console.log(process.env);
export const api_url = process.env.REACT_APP_API_URL;
export const authenticator = authenticators[process.env.PAGESMITH_TEST];
export const developer = process.env.REACT_APP_DEVELOPER === "true";