"use strict";

const { Rooms } = require("./rooms.class");
const hooks = require("./rooms.hooks");

module.exports = function (app) {
  const options = {
    paginate: app.get("paginate"), // Include pagination if needed
  };

  app.use("/rooms", new Rooms(options));

  const service = app.service("rooms");

  service.hooks(hooks);
};
