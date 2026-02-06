import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { port, allowedOrigins } from './config/env.config.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({ contentSecurityPolicy: false }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(
  cors({
    origin: allowedOrigins,
  })
);

// اجعل جميع المسارات تبدأ بـ /api
app.use('/api', routes);
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`flight-backend listening on ${port}`);
});
