const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_hE3dxS9PMIyk@ep-square-art-amvv2j4e-pooler.c-5.us-east-1.aws.neon.tech/neondb?sslmode=require'
});
client.connect()
  .then(() => { console.log('Connected directly via pg'); process.exit(0); })
  .catch(e => { console.error('Connection error', e); process.exit(1); });
