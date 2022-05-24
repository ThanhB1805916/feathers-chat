const users = require('./users/users.service.js')
const messages = require('./messages/messages.service.js');
const inMem = require('./in-mem/in-mem.service.js');
const mongodbService = require('./mongodb-service/mongodb-service.service.js');
const mongooseService = require('./mongoose-service/mongoose-service.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users)
  app.configure(messages);
  app.configure(inMem);
  app.configure(mongodbService);
  app.configure(mongooseService);
}
