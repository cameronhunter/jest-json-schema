const urlRelative = require('url-relative');
const isRelative = require('is-relative-url');
const fetch = require('node-fetch');
const { resolve } = require('path');

module.exports = function createLoadSchema(rootURI, rootDir) {
  const enableLocalFetching = Boolean(rootURI && rootDir);

  return function loadSchema(uri) {
    const path = enableLocalFetching ? urlRelative(rootURI, uri) : uri;

    if (isRelative(path)) {
      try {
        // eslint-disable-next-line global-require, import/no-dynamic-require
        return Promise.resolve(require(resolve(rootDir, path)));
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
