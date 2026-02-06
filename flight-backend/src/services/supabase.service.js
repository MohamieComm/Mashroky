import { createClient } from '@supabase/supabase-js';
import { supabaseEnv } from '../config/env.config.js';

let cachedClient = null;

const getSupabaseClient = () => {
  if (cachedClient) return cachedClient;
  if (!supabaseEnv.url || !supabaseEnv.serviceRoleKey) return null;
  cachedClient = createClient(supabaseEnv.url, supabaseEnv.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return cachedClient;
};

export const upsertPaymentStatus = async (record) => {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('supabase_not_configured');
  }
  const { data, error } = await client
    .from('payments')
    .upsert(record, { onConflict: 'provider,provider_payment_id' })
    .select('id')
    .maybeSingle();
  if (error) throw error;
  return data;
};
