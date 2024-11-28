"use strict";

const { session, neo4j } = require("../../neo4j");

exports.Friends = class Friends {
  // Find all friends or filter by properties
  async find(params) {
    const { query, user } = params;

    if (query.suggestion) {
      return this.suggestFriends(params);
    }

    const id = query.id || user._id;

    const result = await session.run(
      `
      MATCH (u1:User {id: $id})-[:FRIEND]->(u2:User)
      RETURN u2
      LIMIT $limit;
      `,
      { id: id, limit: neo4j.int(query.limit || 10) }
    );

    // Return friends' properties
    return result.records.map((record) => record.get("u2").properties);
  }

  async suggestFriends(params) {
    const { query, user } = params;
    console.log("🚀 ~ Friends ~ suggestFriends ~ query:", query);
    const userId = query.id || user._id;

    const result = await session.run(
      `
      MATCH (user:User {id: $userId})-[:FRIEND]->(friend:User)-[:FRIEND]->(suggestion:User)
      WHERE NOT (user)-[:FRIEND]->(suggestion) AND suggestion.id <> $userId
      RETURN DISTINCT suggestion
      LIMIT $limit;
      `,
      { userId: userId, limit: neo4j.int(query.limit || 10) }
    );

    return result.records.map((record) => record.get("suggestion").properties);
  }

  // Get a friend by ID
  async get(id, params) {
    const { query, user } = params;

    const userId = id || user._id;
    const { friendId } = query;

    const result = await session.run(
      `
      MATCH (u1:User {id: $id})-[:FRIEND]->(u2:User)
      WHERE u2.id = $friendId
      RETURN u2;
      `,
      { id: userId, friendId: friendId }
    );

    // Return friends' properties
    return result.records.map((record) => record.get("u2").properties)[0];
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
