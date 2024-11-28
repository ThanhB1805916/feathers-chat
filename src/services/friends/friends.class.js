"use strict";

const { session } = require("../../neo4j");

exports.Friends = class Friends {
  // Find all friends or filter by properties
  async find(params) {
    const { query, user } = params;

    // Example: Find all friends or filter by a property (e.g., name)
    const result = await session.run(
      `
      MATCH (n:NguoiDung {id: $id})-[:BAN_BE]->(b:NguoiDung)
      RETURN b;
      `,
      { id: user._id }
    );

    // Return friends' properties
    return result.records.map((record) => record.get("b").properties);
  }

  // Create a new friend node
  async create(data, params) {
    const result = await session.run(
      `
      CREATE (f:Friend {name: $name, age: $age, city: $city})
      RETURN f
      `,
      { name: data.name, age: data.age, city: data.city }
    );

    // Return the created friend's properties
    return result.records.map((record) => record.get("f").properties)[0];
  }

  // Update a friend's properties
  async patch(id, data, params) {
    const result = await session.run(
      `
      MATCH (f:Friend)
      WHERE id(f) = $id
      SET f += $properties
      RETURN f
      `,
      { id: parseInt(id, 10), properties: data }
    );

    return result.records.map((record) => record.get("f").properties)[0];
  }

  // Remove a friend by ID
  async remove(id, params) {
    const result = await session.run(
      `
      MATCH (f:Friend)
      WHERE id(f) = $id
      DETACH DELETE f
      RETURN f
      `,
      { id: parseInt(id, 10) }
    );

    return {
      id,
      ...result.records.map((record) => record.get("f").properties)[0],
    };
  }
};
