const assert = require('assert');
const app = require('../../src/app');

describe('\'mongoose-service\' service', () => {
  it('registered the service', () => {
    const service = app.service('mongoose-service');

    assert.ok(service, 'Registered the service');
  });
});
