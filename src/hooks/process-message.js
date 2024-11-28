const { BadRequest } = require("@feathersjs/errors");

module.exports = function (options = {}) {
  // eslint-disable-line no-unused-vars
  return async (context) => {
    const { data } = context;

    console.log(context);

    // Throw an error if we didn't get a text
    if (!data.text) {
      throw new BadRequest("A message must have a text");
    }

    // Text is no longer than 400 characters
    if (data.text.length > 400) {
      throw new BadRequest("Message is too long");
    }

    // The logged in user
    const { user } = context.params;
    // The actual message text
    const text = data.text.substring(0, 400);

    // Update the original data (so that people can't submit additional stuff)
    context.data = {
      text,
      // Set the user id
      userId: user._id,
      // Add the current date
      createdAt: new Date().getTime(),
      // Add room of the message
      roomId: data.roomId,
    };

    return context;
  };
};
