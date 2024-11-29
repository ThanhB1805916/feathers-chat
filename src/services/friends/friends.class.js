"use strict";

const { driver, neo4j } = require("../../neo4j");

exports.Friends = class Friends {
  // Find all friends or filter by properties
  async find(params) {
    const session = driver.session();

    const { query, user } = params;

    if (query.suggestion) {
      return this.suggestFriends(params);
    }

    if (query.beFriend) {
      return this.beFriendList(params);
    }

    const id = query.id || user._id;

    const result = await session.run(
      `
      MATCH (u1:User {id: $id})-[:FRIEND]-(u2:User)
      RETURN u2
      LIMIT $limit;
      `,
      { id: id, limit: neo4j.int(query.limit || 10) }
    );

    // Return friends' properties
    return result.records.map((record) => record.get("u2").properties);
  }

  async suggestFriends(params) {
    const session = driver.session();

    const { query, user } = params;
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

  async beFriendList(params) {
    const session = driver.session();

    const { query, user } = params;
    const userId = query.id || user._id;

    const result = await session.run(
      `
      MATCH (user:User {id: $userId})<-[:BE_FRIEND]-(beFriend:User)
      RETURN DISTINCT beFriend
      LIMIT $limit;
      `,
      { userId: userId, limit: neo4j.int(query.limit || 10) }
    );

    return result.records.map((record) => record.get("beFriend").properties);
  }

  // Get a friend by ID
  async get(id, params) {
    const session = driver.session();

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
    const session = driver.session();

    const { query } = params;

    if (query.beFriend) {
      return this.beFriend(data, params);
    }

    const result = await session.run(
      `
      MATCH (u1:User {id: $id1})
      MATCH (u2:User {id: $id2})
      MERGE (u1)-[r1:FRIEND]->(u2)
        ON CREATE SET r1.since = datetime()
      MERGE (u2)-[r2:FRIEND]->(u1)
        ON CREATE SET r2.since = datetime()
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

  async beFriend(data, params) {
    const session = driver.session();

    const result = await session.run(
      `
      MATCH (u1:User {id: $id1})
      MATCH (u2:User {id: $id2})
      MERGE (u1)-[r:BE_FRIEND]->(u2)
      ON CREATE SET r.since = datetime()
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
    const session = driver.session();

    const { query } = params;
    console.log("🚀 ~ Friends ~ remove ~ query:", query);

    if (query.beFriend) {
      return this.removeBeFriend(id, params);
    }

    const result = await session.run(
      `
      MATCH (u1:User {id: $id1})-[r:FRIEND]-(u2:User {id: $id2})
      DELETE r;
      `,
      { id1: query.id1, id2: query.id2 }
    );

    return result.records;
  }

  async removeBeFriend(id, params) {
    const session = driver.session();

    const { query } = params;
    console.log("🚀 ~ Friends ~ removeBeFriend ~ query:", query);

    const result = await session.run(
      `
      MATCH (u1:User {id: $id1})-[r:BE_FRIEND]-(u2:User {id: $id2})
      DELETE r;
      `,
      { id1: query.id1, id2: query.id2 }
    );

    return result.records;
  }
};
