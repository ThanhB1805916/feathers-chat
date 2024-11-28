"use strict";

const { Friends } = require("./room.class");

module.exports = function (app) {
  const options = {
    paginate: app.get("paginate"), // Include pagination if needed
  };

  app.use("/room", new Friends(options));
};
