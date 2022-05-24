const assert = require('assert');
const app = require('../../src/app');

describe('\'in-mem\' service', () => {
  it('registered the service', () => {
    const service = app.service('in-mem');

    assert.ok(service, 'Registered the service');
  });
});
