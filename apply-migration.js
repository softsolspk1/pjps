const fs = require('fs');
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_hE3dxS9PMIyk@ep-square-art-amvv2j4e-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log('Connected to NeonDB');
    const sql = fs.readFileSync('migrate.sql', 'utf8');
    await client.query(sql);
    console.log('Successfully applied migrate.sql');
    process.exit(0);
  } catch (err) {
    console.error('Error applying migration:', err);
    process.exit(1);
  }
}
run();
