// Initializes the `cus-services` service on path `/cus-services`
const { CusServices } = require('./cus-services.class');
const hooks = require('./cus-services.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/cus-services', new CusServices(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('cus-services');

  service.hooks(hooks);
};
