export function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    console.error(err);
  }
  const message = status >= 500 && isProd ? 'server_error' : err.message || 'server_error';
  res.status(status).json({ error: message });
}
