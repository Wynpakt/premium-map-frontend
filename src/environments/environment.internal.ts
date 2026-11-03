// Same origin as the map. The browser then sends the one basic-auth
// login to /item, /search and /feedback. Apache forwards those to the API.
export const environment = {
  production: true,
  apiHost: '',
  internal: true,
};
