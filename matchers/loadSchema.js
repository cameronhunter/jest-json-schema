const relative = require('url-relative');
const isRelative = require('is-relative-url');
const fetch = require('node-fetch');
const { resolve } = require('path');

function remoteFetch(uri) {
  return fetch(uri).then(response => (response.ok ? response.json() : Promise.reject(new Error(`Couldn't fetch referenced schema "${uri}".`))));
}

module.exports = function createLoadSchema(rootURI, rootDir) {
  if (!rootURI && !rootDir) {
    return remoteFetch;
  }

  return function loadSchema(uri) {
    if (!rootURI) {
      return Promise.reject(new Error('Must define "rootURI" option'));
    }

    if (!rootDir) {
      return Promise.reject(new Error('Must define "rootDir" option'));
    }

    const path = relative(rootURI, uri);
    if (isRelative(path)) {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return Promise.resolve(require(resolve(rootDir, path)));
    }

    return remoteFetch(uri);
  };
};
