const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Helper to convert SQLite '?' parameters to PostgreSQL '$1', '$2', etc.
const convertSql = (sql) => {
    let index = 1;
    return sql.replace(/\?/g, () => `$${index++}`);
};

const run = async (sql, params = []) => {
    const pgSql = convertSql(sql);
    const result = await pool.query(pgSql, params);
    // Mimic SQLite's lastID by looking for a returned id if RETURNING id was used
    let lastID = undefined;
    if (result.rows && result.rows.length > 0 && result.rows[0].id) {
        lastID = result.rows[0].id;
    }
    return { lastID, id: lastID, changes: result.rowCount };
};

const get = async (sql, params = []) => {
    const pgSql = convertSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rows[0] || undefined;
};

const all = async (sql, params = []) => {
    const pgSql = convertSql(sql);
    const result = await pool.query(pgSql, params);
    return result.rows;
};

const initDb = async () => {
    const migrationsDir = path.resolve(__dirname, '../../migrations');
    const files = fs.readdirSync(migrationsDir).sort();
    
    for (const file of files) {
        if (!file.endsWith('.sql')) continue;
        const schema = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        try {
            await pool.query(schema);
        } catch (err) {
            // Ignore common migration duplicate errors
            if (!err.message.includes('already exists') && !err.message.includes('multiple primary keys')) {
                console.error(`Error in migration ${file}:`, err);
                throw err;
            }
        }
    }
};

module.exports = { db: pool, run, get, all, initDb };
