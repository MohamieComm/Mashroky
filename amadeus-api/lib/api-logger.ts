// ============================================================
// API Request Logger — logs to Supabase api_logs table
// ============================================================

import { createServerClient } from './supabase';

interface LogEntry {
  userId?: string;
  endpoint: string;
  method: string;
  requestParams?: Record<string, unknown> | object;
  responseStatus: number;
  responseTimeMs: number;
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
}

export async function logApiRequest(entry: LogEntry): Promise<void> {
  try {
    const supabase = createServerClient();
    await supabase.from('api_logs').insert({
      user_id: entry.userId || null,
      endpoint: entry.endpoint,
      method: entry.method,
      request_params: entry.requestParams || null,
      response_status: entry.responseStatus,
      response_time_ms: entry.responseTimeMs,
      error_message: entry.errorMessage || null,
      ip_address: entry.ipAddress || null,
      user_agent: entry.userAgent || null,
    });
  } catch (err) {
    // Don't let logging failures break the main flow
    console.error('[API Logger] Failed to log request:', err);
  }
}
