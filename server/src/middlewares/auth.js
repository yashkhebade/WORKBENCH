const jwt = require('jsonwebtoken');
const { get, run } = require('../config/db');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

exports.authenticate = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        // First try to verify as a legacy local JWT
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            return next();
        } catch (e) {
            // Not a local token, proceed to check Supabase
        }

        const { data, error } = await supabase.auth.getUser(token);
        if (error || !data.user) throw new Error('Invalid Supabase token');
        
        const email = data.user.email;
        let localUser = await get('SELECT id, name, email, role FROM users WHERE email = ?', [email]);
        
        if (!localUser) {
            // Provision local user seamlessly
            const name = email.split('@')[0];
            const result = await run('INSERT INTO users (name, email, role, password_hash) VALUES (?, ?, ?, ?)', [name, email, 'Member', 'supabase_managed']);
            localUser = { id: result.lastID, name, email, role: 'Member' };
        }
        
        req.user = localUser;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};

exports.requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
};
