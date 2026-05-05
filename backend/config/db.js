const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'artesanos',
  password: 'isaacadmin',
  port: 5432
});

module.exports = pool;

