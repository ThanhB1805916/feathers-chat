// Initializes the `in-mem` service on path `/in-mem`
const { InMem } = require('./in-mem.class');
const hooks = require('./in-mem.hooks');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/in-mem', new InMem(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('in-mem');

  service.hooks(hooks);
};
