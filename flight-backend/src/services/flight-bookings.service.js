import { createClient } from '@supabase/supabase-js';
import { supabaseEnv } from '../config/env.config.js';

const TABLE_NAME = 'flight_bookings';

let cachedClient = null;

const getClient = () => {
  if (cachedClient) return cachedClient;
  if (!supabaseEnv.url || !supabaseEnv.serviceRoleKey) return null;
  cachedClient = createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedClient;
};

export const listFlightBookings = async () => {
  const client = getClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client
    .from(TABLE_NAME)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
};

export const insertFlightBooking = async (payload) => {
  const client = getClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client.from(TABLE_NAME).insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return data;
};
