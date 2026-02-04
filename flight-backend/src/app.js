import express from 'express';
import cors from 'cors';
import { port, allowedOrigins } from './config/env.config.js';
import routes from './routes/index.js';
import { errorMiddleware } from './middlewares/error.middleware.js';

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
  })
);

app.use('/', routes);
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`flight-backend listening on ${port}`);
});
