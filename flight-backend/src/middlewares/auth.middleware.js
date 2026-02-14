import jwt from 'jsonwebtoken';
import { adminApiKey, nodeEnv, supabaseEnv } from '../config/env.config.js';
import { getServiceClient } from '../services/supabase.service.js';

const BEARER_PREFIX = 'bearer ';

const parseAuthHeader = (req) => {
  const raw = String(req.headers.authorization || req.headers.Authorization || '').trim();
  if (!raw) return null;
  if (raw.toLowerCase().startsWith(BEARER_PREFIX)) {
    return raw.slice(BEARER_PREFIX.length).trim();
  }
  return raw;
};

// Cache admin lookups for 5 min to avoid repeated DB calls
const adminCache = new Map();
const ADMIN_CACHE_TTL = 5 * 60 * 1000;

const checkIsAdminInDb = async (userId) => {
  if (!userId) return false;
  const cached = adminCache.get(userId);
  if (cached && Date.now() - cached.ts < ADMIN_CACHE_TTL) return cached.isAdmin;

  let isAdmin = false;
  try {
    const client = getServiceClient();
    if (!client) return false;

    // Check profiles table first
    const { data: profile } = await client
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();
    if (profile && String(profile.role || '').toLowerCase() === 'admin') {
      isAdmin = true;
    }

    // Fallback: check user_roles table
    if (!isAdmin) {
      const { data: userRole } = await client
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      if (userRole) isAdmin = true;
    }
  } catch {
    // Tables may not exist — ignore
  }

  adminCache.set(userId, { isAdmin, ts: Date.now() });
  return isAdmin;
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

export const requireRole = (...roles) => async (req, res, next) => {
  if (!req.user) return res.status(401).json({ error: 'unauthorized' });
  const userRoles = (req.user.roles || []).map((r) => String(r || '').toLowerCase());
  const allowed = roles.map((r) => String(r).toLowerCase());
  let hasRole = allowed.some((r) => userRoles.includes(r));

  // If JWT role is just "authenticated", check DB for actual admin role
  if (!hasRole && req.user.id && req.user.provider === 'supabase') {
    const isDbAdmin = await checkIsAdminInDb(req.user.id);
    if (isDbAdmin) {
      req.user.roles = [...(req.user.roles || []), 'admin'];
      hasRole = true;
    }
  }

  if (!hasRole) return res.status(403).json({ error: 'forbidden' });
  next();
};

export const requireAdmin = requireRole('admin');

export const requireProduction = (_req, res, next) => {
  if (nodeEnv !== 'production') return res.status(400).json({ error: 'not_in_production' });
  next();
};
