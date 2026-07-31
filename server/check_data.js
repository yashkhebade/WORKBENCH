const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  connectionString: process.env.DATABASE_URL
});

async function checkUserData() {
  try {
    await client.connect();
    
    // Check if user has projects
    const projects = await client.query(`SELECT count(*) FROM projects WHERE owner_id = (SELECT id FROM auth.users WHERE email = 'khebadeyash1234@gmail.com')`);
    console.log('Projects:', projects.rows[0].count);
    
    // Check if user has tasks
    const tasks = await client.query(`SELECT count(*) FROM tasks WHERE assignee_id = (SELECT id FROM auth.users WHERE email = 'khebadeyash1234@gmail.com')`);
    console.log('Tasks:', tasks.rows[0].count);

  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

checkUserData();
