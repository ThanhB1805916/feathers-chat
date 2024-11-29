
const crypto = require('crypto');

exports.Messages = class Messages {
    async create(data, params) {
        const { user } = params;

        const id = Date.now().toString();

        const result = await session.run(
            `
            MATCH (u:User {id: $createdById})
            MATCH (r:Room {id: $roomId})
            CREATE (m:Message {id: $id, text: $text, createdAt: $createdAt})
            CREATE (m)-[:FROM]->(u)
            CREATE (m)-[:POSTED_IN]->(r)
            RETURN m, u, r
            `,
            { createdById: user._id, roomId: data.roomId, id: id, text: data.text, createdAt: new new Date().getTime() }
        );

        return result.records.map((record) => record.get("m").properties);
    }
};
