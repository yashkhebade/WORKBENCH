const { run, get, all } = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    static async findByEmail(email) {
        return get('SELECT * FROM users WHERE email = ?', [email]);
    }

    static async findById(id) {
        return get('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    }

    static async create({ name, email, password, role = 'Member' }) {
        const hash = await bcrypt.hash(password, 10);
        return run(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, hash, role]
        );
    }

    static async updatePassword(id, newPassword) {
        const hash = await bcrypt.hash(newPassword, 10);
        return run('UPDATE users SET password_hash = ? WHERE id = ?', [hash, id]);
    }

    static async seedDefaultUsers() {
        const users = await all('SELECT id FROM users');
        if (users.length === 0) {
            console.log('Seeding initial team members...');
            await this.create({ name: 'Admin User', email: 'admin@team.local', password: 'password123', role: 'Admin' });
            await this.create({ name: 'Hardware Engineer', email: 'hardware@team.local', password: 'password123', role: 'Member' });
            await this.create({ name: 'Firmware Engineer', email: 'firmware@team.local', password: 'password123', role: 'Member' });
            console.log('Seed complete! Default password is: password123');
        }
    }
}

module.exports = User;
