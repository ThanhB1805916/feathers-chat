"use strict";

const { Friends } = require("./friends.class");
const hooks = require("./friends.hooks");

module.exports = function (app) {
  const options = {
    paginate: app.get("paginate"),
  };

  // Initialize our service with any options it requires
  app.use("/friends", new Friends(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service("friends");

  service.hooks(hooks);
};
