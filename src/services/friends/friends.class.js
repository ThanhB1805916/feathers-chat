"use strict";

const { session } = require("../../neo4j");

exports.Friends = class Friends {
  // Find all friends or filter by properties
  async find(params) {
    const { query, user } = params;

    const id = query.id || user._id;

    const result = await session.run(
      `
      MATCH (n:User {id: $id})-[:FRIEND]->(b:User)
      RETURN b;
      `,
      { id: id }
    );

    // Return friends' properties
    return result.records.map((record) => record.get("b").properties);
  }

  // Create a new friend node
  async create(data, params) {
    const result = await session.run(
      `
      MATCH (u1:User {id: $id1})
      MATCH (u2:User {id: $id2})
      MERGE (u1)-[:FRIEND]->(u2)
      MERGE (u2)-[:FRIEND]->(u1)
      RETURN u1, u2;
      `,
      { id1: data.id1, id2: data.id2 }
    );

    // Return friends' properties
    return result.records.map((record) => ({
      u1: record.get("u1").properties,
      u2: record.get("u2").properties,
    }));
  }

  // Remove a friend by ID
  async remove(id, params) {
    const { query } = params;

    const result = await session.run(
      `
      MATCH (u1:User {id: $id1})-[r:FRIEND]-(u2:User {id: $id2})
      DELETE r;
      `,
      { id1: query.id1, id2: query.id2 }
    );

    return result.records;
  }
};
