import express from 'express';
import session from 'express-session';
import PgSession from 'connect-pg-simple';
import pkg from 'pg';
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import http from 'http';
import { WebSocketServer } from 'ws';
import { Server } from 'socket.io';

import sequelize from './config/db.js';
import authRoutes from './routes/auth.js';
import chatRoutes from './routes/chatRoutes.js';
import userRoutes from './routes/User.js';

import { userSockets } from './ws/socketStore.js';
import { setupWebSocket } from './ws/wsServer.js'

import './models/UserLike.js';

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

// === Session Parser ===
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

// === Express Setup ===
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
app.use('/api/messages', chatRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => res.send('Music Match API is running!'));

// === HTTP + WebSocketServer (wss) ===
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:9000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.set('io', io); 
setupWebSocket(server);



// === Sequelize Sync ===
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced.');
  })
  .catch((err) => {
    console.error('❌ Failed to sync database:', err.message);
  });

// === Start Server ===
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
