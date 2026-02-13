import { createClient } from '@supabase/supabase-js';
import { supabaseEnv } from '../config/env.config.js';

let cachedServiceClient = null;
let cachedAnonClient = null;

export const getServiceClient = () => {
  if (cachedServiceClient) return cachedServiceClient;
  if (!supabaseEnv.url || !supabaseEnv.serviceRoleKey) return null;
  cachedServiceClient = createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedServiceClient;
};

export const getAnonClient = () => {
  if (cachedAnonClient) return cachedAnonClient;
  if (!supabaseEnv.url || !supabaseEnv.anonKey) return null;
  cachedAnonClient = createClient(supabaseEnv.url, supabaseEnv.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cachedAnonClient;
};

export const upsertPaymentStatus = async (record) => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client
    .from('payments')
    .upsert(record, { onConflict: 'provider,provider_payment_id' })
    .select('id')
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const listTrips = async ({ limit = 100 } = {}) => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client.from('trips').select('*').order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data || [];
};

export const upsertTrip = async (payload) => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client.from('trips').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  return data;
};

export const deleteTrip = async (id) => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const { error } = await client.from('trips').delete().eq('id', id);
  if (error) throw error;
  return true;
};

export const listBookings = async ({ userId } = {}) => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const query = client.from('bookings').select('*').order('created_at', { ascending: false });
  if (userId) query.eq('user_id', userId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
};

export const insertBooking = async (payload) => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client.from('bookings').insert(payload).select('*').maybeSingle();
  if (error) throw error;
  return data;
};

export const updateBookingStatus = async ({ id, status, payment_status }) => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client
    .from('bookings')
    .update({ status, payment_status })
    .eq('id', id)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const listSettings = async () => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client.from('admin_settings').select('*').order('updated_at', { ascending: false }).limit(1);
  if (error) throw error;
  return (data && data[0]) || null;
};

export const upsertSettings = async (payload) => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client.from('admin_settings').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  return data;
};

export const incrementStats = async (table, column = 'views', id) => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const { data, error } = await client.rpc('increment_column', { table_name: table, column_name: column, row_id: id });
  if (error) throw error;
  return data;
};

export const aggregateCounts = async () => {
  const client = getServiceClient();
  if (!client) throw new Error('supabase_not_configured');
  const tables = ['bookings', 'trips', 'flights', 'payments', 'users_admin', 'articles'];
  const results = {};
  await Promise.all(
    tables.map(async (table) => {
      const { count, error } = await client.from(table).select('*', { count: 'exact', head: true });
      if (error) throw error;
      results[table] = count || 0;
    })
  );
  return results;
};
