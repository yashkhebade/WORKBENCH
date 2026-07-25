require('dotenv').config();
const { run, get } = require('./src/config/db');
const bcrypt = require('bcryptjs');

const email = 'khebadeyash1234@gmail.com';
const password = '2006@Yash';
const role = 'admin';
const name = 'Yash Khebade';

(async () => {
  try {
    const row = await get("SELECT * FROM users WHERE email = ?", [email]);
    const hash = await bcrypt.hash(password, 10);
    
    if (row) {
      console.log('User exists. Updating password and role to admin...');
      await run("UPDATE users SET password_hash = ?, role = ? WHERE email = ?", [hash, role, email]);
      console.log('User updated successfully.');
    } else {
      console.log('User does not exist. Creating...');
      await run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", [name, email, hash, role]);
      console.log('User created successfully.');
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
