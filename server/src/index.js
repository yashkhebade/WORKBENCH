require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { initDb } = require('./config/db');
const User = require('./models/User');
const socket = require('./socket');
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');
const fileRoutes = require('./routes/fileRoutes');
const calendarRoutes = require('./routes/calendarRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const noteRoutes = require('./routes/noteRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

// Fail fast if critical secrets aren't configured — no silent fallback secrets.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET is missing or too short (need 32+ chars). Set it in your .env file.');
    console.error("Generate one with: node -e \"console.log(require('crypto').randomBytes(48).toString('hex'))\"");
    process.exit(1);
}

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
    .split(',')
    .map(o => o.trim());

const isAllowedOrigin = (origin, callback) => {
    if (!origin) return callback(null, true); // Allow non-browser requests
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // Allow any Vercel preview link for this specific project and team
    if (/^https:\/\/workbench-.*-yash-99bc\.vercel\.app$/.test(origin)) {
        return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
};

app.use(cors({
    origin: isAllowedOrigin,
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', time: new Date() });
});

// Start Server
initDb()
    .then(async () => {
        console.log('Database schema verified.');
        await User.seedDefaultUsers();
        socket.init(server);
        server.listen(PORT, () => {
            console.log(`Server listening on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error('Failed to initialize database:', err);
        process.exit(1);
    });
