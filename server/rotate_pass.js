const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const client = new Client({ connectionString: process.env.DATABASE_URL });

async function rotatePassword() {
  await client.connect();
  const randomPassword = crypto.randomBytes(16).toString('hex');
  const hash = await bcrypt.hash(randomPassword, 10);
  
  await client.query("UPDATE users SET password_hash = $1 WHERE email = 'khebadeyash1234@gmail.com'", [hash]);
  
  console.log('Password rotated. New password is: ' + randomPassword);
  await client.end();
}

rotatePassword().catch(console.error);
