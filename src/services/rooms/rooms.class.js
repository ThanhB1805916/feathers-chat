// This is the database adapter service class
const { driver } = require("../../neo4j");

exports.Rooms = class Rooms {
  async create(data, params) {
    const session = driver.session();
    const { user } = params;
    
    const id = Date.now().toString();
    
    const result = await session.run(
      `
      MATCH (u:User {id: $createdById})
      CREATE (r:Room {name: $name, id: $id})
      CREATE (r)-[:CREATED_BY]->(u)
      RETURN r, u
      `,
      { createdById: user._id, name: data.name, id: id }
    );

    return result.records.map((record) => ({... record.get("r").properties, createdBy: user._id }));
  }

  async find(params) {
    const session = driver.session();
    const { query, user } = params;

    if(query.name && query.name !== "") {
      return this.findByName(params);
    }

    let cypherQuery;
    let queryParams;

    if (query.roomId) {
      // Find a specific room by its unique id
      cypherQuery = `
        MATCH (r:Room {id: $roomId})
        OPTIONAL MATCH (r)-[:CREATED_BY|:JOINED]-(u:User)
        RETURN r, COLLECT(u) AS users
      `;
      queryParams = { roomId: query.roomId };

      const result = await session.run(cypherQuery, queryParams);

      // Create a map
      // {roomData: r, users: users}
      return result.records.map((record) => {
        const roomData = record.get("r").properties;
        const users = record.get("users").map((user) => user.properties);
        return { ...roomData, users };
      });
    } else {
      // Find all rooms created by a specific user
      cypherQuery = `
          MATCH (u:User {id: $userId})
          OPTIONAL MATCH (u)<-[:CREATED_BY]-(createdRooms:Room)
          OPTIONAL MATCH (u)-[:JOINED]->(joinedRooms:Room)
          RETURN DISTINCT createdRooms, joinedRooms
      `
      queryParams = { userId: user._id };

      const result = await session.run(cypherQuery, queryParams);

      // Merge the createdRooms and joinedRooms arrays without duplicates (check id)
      const rooms = result.records.reduce((acc, record) => {
        const createdRooms = record.get("createdRooms");
        const joinedRooms = record.get("joinedRooms");

        if (createdRooms) {
          acc.push(createdRooms.properties);
        }

        if (joinedRooms) {
          const joinedRoom = joinedRooms.properties;
          if (!acc.find((room) => room.id === joinedRoom.id)) {
            acc.push(joinedRoom);
          }
        }

        return acc;
      }, []);      

      return rooms 
    }  
  }

  async patch(id, data) {
    const session = driver.session();
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

  async update(id, data, params) {
    const { query, user } = params;

    if(query.join) {
      return await this.joinRoom(user._id, id);
    } else if(query.leave) {
      return await this.leaveRoom(user._id, id);
    }
    else {
      throw new Error("BadRequest: 'join' or 'leave' query parameter is required to update a Room.");
    }
  }

  async joinRoom(userId, roomId){
    const session = driver.session();
    const result = await session.run(
      `
      MATCH (u:User {id: $userId}), (r:Room {id: $roomId})
      MERGE (u)-[:JOINED]->(r)
      RETURN u, r
      `,
      { userId: userId, roomId: roomId }
    );

    
    // return user and room
    return result.records.map((record) => {
      const user = record.get("u").properties;
      const room = record.get("r").properties;
      return { action: 'join', user, room };
    });
  }

  async leaveRoom(userId, roomId){
    const session = driver.session();
    const result = await session.run(
      `
      MATCH (r:Room {id: $roomId})
      OPTIONAL MATCH (r)-[rel]-(u:User {id: $userId})
      DELETE rel
      WITH r
      WHERE NOT EXISTS { MATCH (r)-[]-() }
      DELETE r
      `,
      { roomId: roomId, userId: userId }
    );

    return { action: 'leave', user: {_id: userId}, room: {id: roomId} };
  }

  async remove(id) {
    const session = driver.session();
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
  
  async findByName(params) {
    const { query, user } = params;

    const name = query.name;

    if (!name || name == "") {
      throw new Error("BadRequest: 'name' is required and cannot be an empty string.");
    }
    const session = driver.session();
    const result = await session.run(
      `
        MATCH (r:Room)
        WHERE toLower(r.name) CONTAINS toLower($name)
        AND NOT EXISTS {
          MATCH (r)-[:CREATED_BY]->(:User {id: $userId})
          RETURN 1
        }
        AND NOT EXISTS {
          MATCH (:User {id: $userId})-[:JOINED]->(r)
          RETURN 1
        }
        RETURN r
      `, 
      {
        name: name, 
        userId: user._id
      }
    );

    return result.records.map((record) => record.get("r").properties);
  }
};
