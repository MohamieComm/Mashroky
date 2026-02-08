import { getAnonClient, getServiceClient } from '../services/supabase.service.js';

export const signup = async (req, res, next) => {
  try {
    const { email, password, full_name } = req.body || {};
    const client = getAnonClient();
    if (!client) return res.status(500).json({ error: 'supabase_not_configured' });
    if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: { data: { full_name } },
    });
    if (error) throw error;
    res.json({ user: data.user, session: data.session });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const client = getAnonClient();
    if (!client) return res.status(500).json({ error: 'supabase_not_configured' });
    if (!email || !password) return res.status(400).json({ error: 'missing_credentials' });
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    res.json({ user: data.user, session: data.session });
  } catch (err) {
    next(err);
  }
};

export const me = async (req, res, next) => {
  try {
    const service = getServiceClient();
    if (!service || !req.user?.id) return res.status(401).json({ error: 'unauthorized' });
    const { data, error } = await service.from('profiles').select('*').eq('user_id', req.user.id).maybeSingle();
    if (error) throw error;
    res.json({ user: req.user, profile: data });
  } catch (err) {
    next(err);
  }
};
