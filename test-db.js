/* eslint-disable */
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
require('dotenv').config();

async function checkTable() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('Tables in public schema:', res.rows.map(r => r.table_name));
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
checkTable();
