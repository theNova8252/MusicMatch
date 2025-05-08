import express from 'express';
import session from 'express-session';
import PgSession from 'connect-pg-simple';
import pkg from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer } from 'ws';

import sequelize from './config/db.js';
import authRoutes from './routes/auth.js';
import matchRoutes from './routes/match.js';
import chatRoutes from './routes/chat.js';
import userRoutes from './routes/User.js';

import './models/UserLike.js'; // ensure UserLike model is initialized

dotenv.config();

// === DB setup ===
const { Pool } = pkg;
const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

// === Session Parser (reusable for both Express and WS) ===
const PgStore = PgSession(session);
const sessionParser = session({
  store: new PgStore({
    pool: pgPool,
    createTableIfMissing: true,
  }),
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24,
  },
});

// === Express App Setup ===
const app = express();
app.use(sessionParser);
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:9000'],
    credentials: true,
  }),
);
app.use(bodyParser.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);
app.get('/', (req, res) => res.send('Music Match API is running!'));

// === HTTP + WebSocket Setup ===
const server = http.createServer(app);
const wss = new WebSocketServer({ noServer: true });
const userSockets = new Map();

server.on('upgrade', (request, socket, head) => {
  sessionParser(request, {}, () => {
    if (!request.session?.userId) {
      socket.destroy();
      return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => {
      const userId = request.session.userId;
      userSockets.set(userId, ws);

      ws.on('close', () => {
        userSockets.delete(userId);
      });
    });
  });
});

// === Sequelize Sync ===
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced.');
  })
  .catch((err) => {
    console.error('Failed to sync database:', err.message);
  });

// === Start Server ===
server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on port ${process.env.PORT || 5000}`);
});
