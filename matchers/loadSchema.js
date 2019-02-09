const urlRelative = require('url-relative');
const isRelative = require('is-relative-url');
const fetch = require('node-fetch');
const { resolve } = require('path');

module.exports = function createLoadSchema(rootURI, rootDir) {
  if (!rootURI && !rootDir) {
    return undefined;
  }

  if (!rootURI) {
    throw new Error('Must define "rootURI" option');
  }

  if (!rootDir) {
    throw new Error('Must define "rootDir" option');
  }

  return function loadSchema(uri) {
    const path = urlRelative(rootURI, uri);

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
