const { driver } = require("../../neo4j");
const crypto = require('crypto');

exports.Messages = class Messages {
    async create(data, params) {
        const session = driver.session();
        const { user } = params;

        const id = crypto.randomUUID();

        const result = await session.run(
            `
            MATCH (u:User {id: $createdById})
            MATCH (r:Room {id: $roomId})
            CREATE (m:Message {id: $id, text: $text, createdAt: $createdAt})
            CREATE (m)-[:FROM]->(u)
            CREATE (m)-[:POSTED_IN]->(r)
            RETURN m, u, r
            `,
            { createdById: user._id, roomId: data.roomId, id: id, text: data.text, createdAt: new Date().getTime() }
        );

        return result.records.map((record) => ({
            ...record.get("m").properties,
            user: record.get("u").properties,
            room: record.get("r").properties,
        }));
    }

    async find(params){
        const session = driver.session();
        const {query, user} = params;

        if(!query.roomId){
            throw new Error("No roomId provided");
        }

        const result = await session.run(
            `
            MATCH (m:Message)-[:FROM]->(u:User)
            MATCH (m)-[:POSTED_IN]->(r:Room {id: $roomId})
            RETURN m, u
            ORDER BY m.createdAt ASC
            `,
            {roomId: query.roomId}
        );

        return result.records.map((record) => ({
            ...record.get("m").properties,
            user: record.get("u").properties,
        }));
    }
};
