import jwt from 'jsonwebtoken';
import { adminApiKey, nodeEnv, supabaseEnv } from '../config/env.config.js';

const BEARER_PREFIX = 'bearer ';

const parseAuthHeader = (req) => {
  const raw = String(req.headers.authorization || req.headers.Authorization || '').trim();
  if (!raw) return null;
  if (raw.toLowerCase().startsWith(BEARER_PREFIX)) {
    return raw.slice(BEARER_PREFIX.length).trim();
  }
  return raw;
};

const decodeSupabaseJwt = (token) => {
  if (!token || !supabaseEnv.jwtSecret) return null;
  try {
    const payload = jwt.verify(token, supabaseEnv.jwtSecret, { algorithms: ['HS256'] });
    return {
      id: payload.sub || null,
      email: payload.email || payload['user_email'] || null,
      roles: Array.isArray(payload.role) ? payload.role : [payload.role || payload['app_role']].filter(Boolean),
      raw: payload,
      provider: 'supabase',
    };
  } catch {
    return null;
  }
};

const decodeStaticAdminKey = (token) => {
  if (!token || !adminApiKey) return null;
  if (token !== adminApiKey) return null;
  return {
    id: 'admin-static',
    email: 'admin@local',
    roles: ['admin'],
    provider: 'static-key',
  };
};

export const attachUser = (req, _res, next) => {
  const token = parseAuthHeader(req);
  const supabaseUser = decodeSupabaseJwt(token);
  const adminUser = decodeStaticAdminKey(token);
  const user = supabaseUser || adminUser || null;
  req.user = user;
  next();
};

export const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const userRoles = (req.user.roles || []).map((r) => String(r || '').toLowerCase());
  const allowed = roles.map((r) => String(r).toLowerCase());
  const hasRole = allowed.some((r) => userRoles.includes(r));
  if (!hasRole) return res.status(403).json({ error: 'forbidden' });
  next();
};

export const requireAdmin = requireRole('admin');

export const requireProduction = (_req, res, next) => {
  if (nodeEnv !== 'production') return res.status(400).json({ error: 'not_in_production' });
  next();
};
