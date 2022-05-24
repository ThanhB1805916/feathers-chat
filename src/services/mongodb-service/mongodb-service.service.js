// Initializes the `mongodb-service` service on path `/mongodb-service`
const { MongodbService } = require('./mongodb-service.class');
const hooks = require('./mongodb-service.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/mongodb-service', new MongodbService(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('mongodb-service');

  service.hooks(hooks);
};
