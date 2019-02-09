const createLoadSchema = require('../../matchers/loadSchema');
const path = require('path');
const fetch = require('node-fetch');
const remoteSchema = require('./__fixtures__/remote-schema.json');
const serializer = require('jest-serializer-path');

expect.addSnapshotSerializer(serializer);
jest.mock('node-fetch');

const fixtures = path.join(__dirname, '__fixtures__');

describe('loadSchema', () => {
  it('throws if there is no rootURI specified', () => {
    expect(() => createLoadSchema(undefined, __dirname)).toThrowErrorMatchingSnapshot();
  });

  it('throws if there is no rootDir specified', () => {
    expect(() => createLoadSchema('http://my-domain.com/schema', undefined)).toThrowErrorMatchingSnapshot();
  });

  it('resolves local files', () => {
    const loadSchema = createLoadSchema('http://my-domain.com/schema', fixtures);

    expect(loadSchema('http://my-domain.com/schema/schema-with-defs.json')).resolves.toMatchSnapshot();
  });

  it('rejects local files that cannot be loaded', () => {
    const loadSchema = createLoadSchema('http://my-domain.com/schema', fixtures);

    expect(loadSchema('http://my-domain.com/schema/nonexistent-schema.json')).rejects.toThrowErrorMatchingSnapshot();
  });

  it('resolves remote files', () => {
    const loadSchema = createLoadSchema('http://my-domain.com/schema', fixtures);

    fetch.mockImplementation(() => Promise.resolve({ ok: true, json: () => remoteSchema }));

    expect(loadSchema('http://not-my-domain.com/remote-schema.json')).resolves.toMatchSnapshot();
  });

  it('rejects if remote files cannot be fetched', () => {
    const loadSchema = createLoadSchema('http://my-domain.com/schema', fixtures);

    fetch.mockImplementation(() => Promise.resolve({ ok: false }));

    expect(loadSchema('http://not-my-domain.com/remote-schema.json')).rejects.toThrowErrorMatchingSnapshot();
  });
});
