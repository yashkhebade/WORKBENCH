const { run, get, all } = require('../config/db');

class Subject {
    static async findAll() {
        return all('SELECT * FROM subjects ORDER BY name ASC');
    }

    static async create(name) {
        return run('INSERT INTO subjects (name) VALUES (?) RETURNING *', [name]);
    }
}

module.exports = Subject;
