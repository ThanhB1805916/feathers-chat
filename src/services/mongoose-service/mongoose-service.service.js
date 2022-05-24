// Initializes the `mongoose-service` service on path `/mongoose-service`
const { MongooseService } = require('./mongoose-service.class');
const createModel = require('../../models/mongoose-service.model');
const hooks = require('./mongoose-service.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/mongoose-service', new MongooseService(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('mongoose-service');

  service.hooks(hooks);
};
