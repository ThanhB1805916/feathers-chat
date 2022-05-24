const assert = require('assert');
const app = require('../../src/app');

describe('\'cus-services\' service', () => {
  it('registered the service', () => {
    const service = app.service('cus-services');

    assert.ok(service, 'Registered the service');
  });
});
