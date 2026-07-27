const { Pool } = require('pg');
const pool = new Pool({
    connectionString: 'postgresql://postgres.npxohowxnjjuxcrdkqas:yashkhebade1234!!@@@aws-0-ap-south-1.pooler.supabase.com:6543/postgres'
});
pool.query('SELECT 1').catch(err => {
    console.error(err);
    process.exit(1);
});
