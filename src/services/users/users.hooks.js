const { authenticate } = require("@feathersjs/authentication").hooks;
const { session } = require("../../neo4j");

const { hashPassword, protect } =
  require("@feathersjs/authentication-local").hooks;

module.exports = {
  before: {
    all: [],
    find: [authenticate("jwt")], // Lấy hết
    get: [authenticate("jwt")], // Lấy theo id
    create: [hashPassword("password")], // Thêm
    update: [hashPassword("password"), authenticate("jwt")], // Sửa
    patch: [hashPassword("password"), authenticate("jwt")], // Sửa
    remove: [authenticate("jwt")], // Xóa
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect("password"),
    ],
    find: [],
    get: [],
    create: [
      async (context) => {
        const { result } = context; // The newly created user

        try {
          await session.run(
            "CREATE (u:User {id: $id, email: $email, avatar: $avatar})",
            {
              id: result._id,
              email: result.email,
              avatar: result.avatar,
            }
          );
        } catch (error) {
          // Handle errors gracefully, perhaps log them or even revert the user creation
          console.error("Error creating Neo4j node:", error);
          throw error; // Re-throw to trigger Feathers error handling
        }

        return context;
      },
    ],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
