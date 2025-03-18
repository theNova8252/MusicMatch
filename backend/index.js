import express from 'express';
import session from 'express-session';
import PgSession from 'connect-pg-simple';
import pkg from 'pg'; // Import pg as default and extract Pool
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.js';
import matchRoutes from './routes/match.js';
import chatRoutes from './routes/chat.js';
import sequelize from './config/db.js';
import path from 'path';

dotenv.config({path: path.resolve("./backend/", '.env')});
//dotenv.config();
console.log("DB_PASSWORD:", process.env.DB_PASS, typeof process.env.DB_PASS);


// Log the values of DB_USER and DB_PASS
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);

const { Pool } = pkg; // Extract Pool from pg

//Set up PostgreSQL pool
const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const app = express();
const PgStore = PgSession(session);

//Set up session middleware
app.use(
  session({
    store: new PgStore({
      pool: pgPool,
      createTableIfMissing: true, // This creates the session table automatically
    }),
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  }),
);

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(bodyParser.json());

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/match', matchRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => res.send('Music Match API is running!'));



//Database Sync
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced.');
  })
  .catch((error) => {
    console.error('Failed to sync database:', error.message);
  });

//Start Server
app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
