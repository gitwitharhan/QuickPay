import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import cookieParser from 'cookie-parser';
import transactionRoutes from './routes/transaction.routes';
import accountRequestRoutes from './routes/accountRequest.routes';


const app = express();
const normalizeOrigin = (origin: string) => origin.replace(/\/$/, '');

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URLS,
]
  .flatMap((value) => value?.split(',') ?? [])
  .map((value) => value.trim())
  .filter(Boolean)
  .map(normalizeOrigin);

/** Middleware  */
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'https://quick-pay-silk.vercel.app',
  ...configuredOrigins,
].map(normalizeOrigin));

const isAllowedVercelOrigin = (origin: string) => /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin);

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    const normalizedOrigin = normalizeOrigin(origin);

    if (allowedOrigins.has(normalizedOrigin) || isAllowedVercelOrigin(normalizedOrigin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));

/** Routes */ 
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transaction', transactionRoutes);
app.use('/api/account-request', accountRequestRoutes);


app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;
