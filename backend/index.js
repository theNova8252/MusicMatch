import express from 'express';
import session from 'express-session';
import PgSession from 'connect-pg-simple';
import pkg from 'pg'; 
import cors from 'cors';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
console.log('Auth routes loaded:', authRoutes);
import matchRoutes from './routes/match.js';
import chatRoutes from './routes/chat.js';
import sequelize from './config/db.js';
import path from 'path';
import userRoutes from './routes/User.js';



dotenv.config();
console.log("DB_PASSWORD:", process.env.DB_PASS, typeof process.env.DB_PASS);


console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASS:', process.env.DB_PASS);

const { Pool } = pkg; 


const pgPool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

const app = express();
const PgStore = PgSession(session);
app.use(
  session({
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
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  }),
);

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



//Database Sync
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log('Database synced.');
  })
  .catch((error) => {
    console.error('Failed to sync database:', error.message);
  });

app.listen(process.env.PORT || 5000, () =>
  console.log(`Server running on port ${process.env.PORT || 5000}`)
);
