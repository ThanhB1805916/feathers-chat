"use strict";

const { Friends } = require("./friends.class");

module.exports = function (app) {
  const options = {
    paginate: app.get("paginate"), // Include pagination if needed
  };

  // Register the service at the `/friends` endpoint
  app.use("/friends", new Friends(options));
};
