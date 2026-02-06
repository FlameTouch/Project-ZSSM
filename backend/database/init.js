const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDatabase() {
  // Connect to default postgres database first to create truerate database
  const adminPool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: 'postgres', // Connect to default database
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
  });

  try {
    console.log('Connecting to PostgreSQL...');
    
    // Check if database exists
    const dbCheck = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [process.env.DB_NAME || 'truerate']
    );

    if (dbCheck.rows.length === 0) {
      console.log(`Creating database ${process.env.DB_NAME || 'truerate'}...`);
      await adminPool.query(`CREATE DATABASE ${process.env.DB_NAME || 'truerate'}`);
      console.log('Database created successfully!');
    } else {
      console.log('Database already exists.');
    }

    await adminPool.end();

    // Now connect to truerate database and run schema
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'truerate',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    });

    console.log('Reading schema file...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Executing schema...');
    await pool.query(schema);
    console.log('Schema executed successfully!');

    await pool.end();
    console.log('\n✅ Database initialization completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing database:', error.message);
    console.error('\nMake sure:');
    console.error('1. PostgreSQL is installed and running');
    console.error('2. Database credentials in .env file are correct');
    console.error('3. PostgreSQL service is started');
    process.exit(1);
  }
}

initDatabase();
