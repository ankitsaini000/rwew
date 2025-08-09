import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import routes from './routes';
import creatorVerificationRoutes from './routes/creatorVerificationRoutes';
import brandPreferenceRoutes from './routes/brandPreferenceRoutes';
import ollamaRoutes from './routes/ollamaRoutes';
import creatorBankAccountRoutes from './routes/creatorBankAccountRoutes';
import searchHistoryRoutes from './routes/searchHistoryRoutes';

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', routes);
app.use('/api/creator-verification', creatorVerificationRoutes);
app.use('/api/brand-preferences', brandPreferenceRoutes);
app.use('/api/ollama', ollamaRoutes);
app.use('/api/creator-bank-accounts', creatorBankAccountRoutes);
app.use('/api/search-history', searchHistoryRoutes);

export default app; 