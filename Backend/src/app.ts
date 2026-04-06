import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import accountRoutes from './routes/account.routes';
import cookieParser from 'cookie-parser';
import transactionRoutes from './routes/transaction.routes';

const app = express();

/** Middleware  */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://quick-pay-silk.vercel.app',
  'https://quickpay-7rda.onrender.com',
];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static('public'));
app.use()
/** Routes */ 
app.use('/api/auth', authRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/transaction', transactionRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;