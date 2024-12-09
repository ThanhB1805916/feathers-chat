"use strict";

const neo4j = require("neo4j-driver");

// Replace with your Neo4j URI, username, and password
const driver = neo4j.driver(
  "bolt://localhost:7687", // Neo4j connection string
  neo4j.auth.basic("neo4j", "neo4j@123") // Credentials
);

module.exports = { driver, neo4j };
