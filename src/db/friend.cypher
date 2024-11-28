MATCH (u:User) RETURN u LIMIT 25;

// Get all friend of user
MATCH (n:User {id: $id})-[:FRIEND]->(b:User)
RETURN b;

// Add friend
// MATCH (u1:User {id: $id1})
// MATCH (u2:User {id: $id2})
// MERGE (u1)-[:FRIEND]->(u2)
// MERGE (u2)-[:FRIEND]->(u1)
// RETURN u1, u2;
MATCH (u1:User {id: "eI9sD37dyDWDARfE"})
MATCH (u2:User {id: "dgb5hP2ccIAYm4Xg"})
MERGE (u1)-[:FRIEND]->(u2)
MERGE (u2)-[:FRIEND]->(u1)
RETURN u1, u2;


// Unfriend
// MATCH (u1:User {id: $id1})-[r:FRIEND]-(u2:User {id: $id2})
// DELETE r;
MATCH (u1:User {id: "eI9sD37dyDWDARfE"})-[r:FRIEND]-(u2:User {id: "dgb5hP2ccIAYm4Xg"})
DELETE r;

