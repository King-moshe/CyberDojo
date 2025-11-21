import express, { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import scenariosRouter from './routes/scenarios';
import runsRouter from './routes/runs';
import alertsRouter from './routes/alerts';
import summaryRouter from './routes/summary';
import errorHandler from './middleware/errorHandler';

const app = express();

app.use(morgan('dev'));
app.use(express.json());

// Basic health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

// API Routes
app.use('/api/scenarios', scenariosRouter);
app.use('/api/runs', runsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/summary', summaryRouter);

// Centralized error handler
app.use(errorHandler as unknown as (err: Error, req: Request, res: Response, next: NextFunction) => void);

export default app;
