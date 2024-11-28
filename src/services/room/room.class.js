// This is the database adapter service class
const { session } = require("../../neo4j");

exports.Room = class Room {
  async create(data, params) {
    const result = await session.run(
      `
      MATCH (u:User {id: $createdById})
      CREATE (r:Room {name: $name, id: $id})
      CREATE (r)-[:CREATED_BY]->(u)
      RETURN r, u
      `,
      { createdById: data.createdById, name: data.name, id: data.id }
    );

    return result.records.map((record) => record.get("r").properties);
  }

  async find(params) {
    const { query } = params;

    // Validate input
    if (!query || (!query.createdById && !query.roomId)) {
      throw new Error("BadRequest: Either 'createdById' or 'roomId' must be provided.");
    }

    let cypherQuery;
    let queryParams;

    if (query.createdById) {
      // Find all rooms created by a specific user
      cypherQuery = `
        MATCH (u:User {id: $createdById})-[:CREATED_BY]->(r:Room)
        RETURN r
      `;
      queryParams = { createdById: query.createdById };
    } else if (query.roomId) {
      // Find a specific room by its unique id
      cypherQuery = `
        MATCH (r:Room {id: $roomId})
        RETURN r
      `;
      queryParams = { roomId: query.roomId };
    }

    const result = await session.run(cypherQuery, queryParams);

    // Map over the result and extract properties of Room nodes
    return result.records.map((record) => record.get("r").properties);
  }

  async patch(id, data) {
    if (!id || !data.name) {
      throw new Error("BadRequest: 'id' and 'name' are required to update a Room.");
    }

    const result = await session.run(
      `
      MATCH (r:Room {id: $id})
      SET r.name = $name
      RETURN r
      `,
      { id, name: data.name }
    );

    // Return the updated Room's properties
    const updatedRoom = result.records[0]?.get("r")?.properties;

    if (!updatedRoom) {
      throw new Error(`NotFound: No Room found with id '${id}'.`);
    }

    return updatedRoom;
  }

  async remove(id) {
    if (!id) {
      throw new Error("BadRequest: 'id' is required to delete a Room.");
    }
  
    const result = await session.run(
      `
      MATCH (r:Room {id: $id})
      DETACH DELETE r
      RETURN r
      `,
      { id }
    );
  
    if (!result.records.length) {
      throw new Error(`NotFound: No Room found with id '${id}'.`);
    }
  
    return { message: `Room with id '${id}' has been deleted.` };
  }
  
};
