export function errorMiddleware(err, req, res, next) {
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    console.error(err);
  }
  const shouldExpose = err.expose === true || status < 500 || !isProd;
  const message = shouldExpose ? err.message || 'server_error' : 'server_error';
  res.status(status).json({ error: message });
}
