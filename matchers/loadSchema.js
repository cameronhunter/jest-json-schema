const urlRelative = require('url-relative');
const fetch = require('node-fetch');
const path = require('path');

module.exports = function createLoadSchema(resolutions = {}) {
  const entries = Object.entries(resolutions);
  return function loadSchema(uri) {
    const localSource = entries.find(([rootURI]) => uri.startsWith(rootURI));

    if (localSource) {
      const [rootURI, rootDir] = localSource;
      const relativePath = urlRelative(rootURI, uri);
      const absolutePath = path.resolve(rootDir, relativePath);
      try {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return Promise.resolve(require(absolutePath));
      } catch (e) {
        return Promise.reject(e);
      }
    }

    return fetch(uri).then(response =>
      (response.ok
        ? response.json()
        : Promise.reject(new Error(`Couldn't fetch referenced schema "${uri}".`)))
    );
  };
};
