const createLoadSchema = require('../../matchers/loadSchema');
const path = require('path');
const fetch = require('node-fetch');
const remoteSchema = require('./__fixtures__/remote-schema.json');
const serializer = require('jest-serializer-path');

expect.addSnapshotSerializer(serializer);
jest.mock('node-fetch');

const fixtures = path.join(__dirname, '__fixtures__');

describe('loadSchema', () => {
  it('resolves local files', () => {
    const loadSchema = createLoadSchema({ 'http://my-domain.com/schema': fixtures });

    return expect(
      loadSchema('http://my-domain.com/schema/schema-with-defs.json')
    ).resolves.toMatchSnapshot();
  });

  it('rejects local files that cannot be loaded', () => {
    const loadSchema = createLoadSchema({ 'http://my-domain.com/schema': fixtures });

    return expect(
      loadSchema('http://my-domain.com/schema/nonexistent-schema.json')
    ).rejects.toThrowErrorMatchingSnapshot();
  });

  it('resolves remote files', () => {
    const loadSchema = createLoadSchema();

    fetch.mockImplementation(() => Promise.resolve({ ok: true, json: () => remoteSchema }));

    return expect(
      loadSchema('http://not-my-domain.com/remote-schema.json')
    ).resolves.toMatchSnapshot();
  });

  it('rejects if remote files cannot be fetched', () => {
    const loadSchema = createLoadSchema();

    fetch.mockImplementation(() => Promise.resolve({ ok: false }));

    return expect(
      loadSchema('http://not-my-domain.com/remote-schema.json')
    ).rejects.toThrowErrorMatchingSnapshot();
  });
});
