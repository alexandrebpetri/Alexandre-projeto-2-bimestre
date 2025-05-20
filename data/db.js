const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // Armazene a connection string em uma variável de ambiente
  ssl: {
    rejectUnauthorized: false
  }
});

module.exports = pool;
