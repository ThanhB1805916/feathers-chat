const assert = require('assert');
const app = require('../../src/app');

describe('\'mongodb-service\' service', () => {
  it('registered the service', () => {
    const service = app.service('mongodb-service');

    assert.ok(service, 'Registered the service');
  });
});
