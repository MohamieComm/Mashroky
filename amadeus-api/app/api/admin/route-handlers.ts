// ============================================================
// Admin API Route Handlers
// RBAC-protected endpoints for admin dashboard
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { resetAmadeusClient } from '@/lib/amadeus-server';

async function requireAdmin(req: NextRequest) {
  const supabase = createServerClient();
  const authHeader = req.headers.get('authorization');
  if (!authHeader) throw new Error('Unauthorized');

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) throw new Error('Unauthorized');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
    throw new Error('Forbidden: Admin access required');
  }

  return { user, role: profile.role };
}

// ── Dashboard Stats ─────────────────────────────────────────

export async function getDashboardStats(req: NextRequest) {
  try {
    await requireAdmin(req);
    const supabase = createServerClient();

    const [bookings, users, logs] = await Promise.all([
      supabase.from('bookings').select('id, booking_type, status, total_amount, currency, created_at'),
      supabase.from('profiles').select('id, role, created_at'),
      supabase.from('api_logs').select('id, endpoint, response_status, response_time_ms, created_at')
        .order('created_at', { ascending: false }).limit(100),
    ]);

    const bookingsData = bookings.data || [];
    const usersData = users.data || [];
    const logsData = logs.data || [];

    const stats = {
      totalBookings: bookingsData.length,
      bookingsByType: {
        flight: bookingsData.filter(b => b.booking_type === 'flight').length,
        hotel: bookingsData.filter(b => b.booking_type === 'hotel').length,
        transfer: bookingsData.filter(b => b.booking_type === 'transfer').length,
        activity: bookingsData.filter(b => b.booking_type === 'activity').length,
      },
      bookingsByStatus: {
        confirmed: bookingsData.filter(b => b.status === 'confirmed').length,
        pending: bookingsData.filter(b => b.status === 'pending').length,
        cancelled: bookingsData.filter(b => b.status === 'cancelled').length,
        failed: bookingsData.filter(b => b.status === 'failed').length,
      },
      totalRevenue: bookingsData
        .filter(b => b.status === 'confirmed')
        .reduce((sum, b) => sum + (parseFloat(b.total_amount) || 0), 0),
      totalUsers: usersData.length,
      adminUsers: usersData.filter(u => u.role === 'admin' || u.role === 'super_admin').length,
      apiCalls: logsData.length,
      avgResponseTime: logsData.length > 0
        ? Math.round(logsData.reduce((sum, l) => sum + (l.response_time_ms || 0), 0) / logsData.length)
        : 0,
      errorRate: logsData.length > 0
        ? Math.round((logsData.filter(l => (l.response_status || 0) >= 400).length / logsData.length) * 100)
        : 0,
    };

    return NextResponse.json({ data: stats });
  } catch (err: any) {
    const status = err.message === 'Unauthorized' ? 401 : err.message.includes('Forbidden') ? 403 : 500;
    return NextResponse.json({ error: err.message }, { status });
  }
}

// ── API Logs ────────────────────────────────────────────────

export async function getApiLogs(req: NextRequest) {
  try {
    await requireAdmin(req);
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;

    const { data, count } = await supabase
      .from('api_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    return NextResponse.json({ data, meta: { total: count, page, limit } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Bookings List ───────────────────────────────────────────

export async function getBookings(req: NextRequest) {
  try {
    await requireAdmin(req);
    const supabase = createServerClient();
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const offset = (page - 1) * limit;

    let query = supabase
      .from('bookings')
      .select('*, profiles!inner(full_name, email)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (type) query = query.eq('booking_type', type);

    const { data, count } = await query;
    return NextResponse.json({ data, meta: { total: count, page, limit } });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Users List ──────────────────────────────────────────────

export async function getUsers(req: NextRequest) {
  try {
    const { role } = await requireAdmin(req);
    const supabase = createServerClient();

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Update User Role ────────────────────────────────────────

export async function updateUserRole(req: NextRequest) {
  try {
    const { role: adminRole } = await requireAdmin(req);
    if (adminRole !== 'super_admin') {
      return NextResponse.json({ error: 'Only super admins can change roles' }, { status: 403 });
    }

    const { userId, newRole } = await req.json();
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── Amadeus Config ──────────────────────────────────────────

export async function getAmadeusConfig(req: NextRequest) {
  try {
    const { role } = await requireAdmin(req);
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin required' }, { status: 403 });
    }

    const supabase = createServerClient();
    const { data } = await supabase.from('amadeus_config').select('*').single();
    return NextResponse.json({ data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function updateAmadeusConfig(req: NextRequest) {
  try {
    const { role } = await requireAdmin(req);
    if (role !== 'super_admin') {
      return NextResponse.json({ error: 'Super admin required' }, { status: 403 });
    }

    const body = await req.json();
    const supabase = createServerClient();

    const { data: existing } = await supabase.from('amadeus_config').select('id').single();

    let result;
    if (existing) {
      result = await supabase
        .from('amadeus_config')
        .update(body)
        .eq('id', existing.id)
        .select()
        .single();
    } else {
      result = await supabase
        .from('amadeus_config')
        .insert(body)
        .select()
        .single();
    }

    // Reset cached Amadeus client to pick up new config
    resetAmadeusClient();

    return NextResponse.json({ data: result.data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
