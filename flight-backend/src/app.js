import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { port, allowedOrigins } from './config/env.config.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: false, // يتم إدارتها من الواجهة الأمامية (SPA)
  crossOriginEmbedderPolicy: false,
}));
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

// خدمة ملفات الواجهة الأمامية (SPA)
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));
// أي مسار غير /api يرجع index.html (React Router)
app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
  console.log(`flight-backend listening on ${port}`);
});
