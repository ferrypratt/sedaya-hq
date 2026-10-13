import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleName = searchParams.get('module');
    const supabase = await createClient();

    if (moduleName === 'sedaya_activities') {
      const { data, error } = await supabase
        .from('daily_activities')
        .select('*, pic:profiles(*), project:projects(*)')
        .order('activity_date', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (moduleName === 'sedaya_unit_snapshots') {
      const { data, error } = await supabase
        .from('unit_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      // Group by project_id
      const grouped: Record<string, unknown[]> = {};
      (data || []).forEach((row) => {
        if (!grouped[row.project_id]) grouped[row.project_id] = [];
        grouped[row.project_id].push(row);
      });

      return NextResponse.json({ success: true, data: grouped });
    }

    if (moduleName === 'sedaya_kos_snapshots') {
      const { data, error } = await supabase
        .from('kos_snapshots')
        .select('*')
        .order('snapshot_date', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }

      const grouped: Record<string, unknown[]> = {};
      (data || []).forEach((row) => {
        if (!grouped[row.project_id]) grouped[row.project_id] = [];
        grouped[row.project_id].push(row);
      });

      return NextResponse.json({ success: true, data: grouped });
    }

    if (moduleName === 'sedaya_content_items') {
      const { data, error } = await supabase
        .from('content_items')
        .select('*, pic:profiles(*), project:projects(*)')
        .order('publish_date', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (moduleName === 'sedaya_marketing_plans') {
      const { data, error } = await supabase
        .from('marketing_plans')
        .select('*, items:plan_items(*)')
        .order('period_start', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (moduleName === 'sedaya_evaluations') {
      const { data, error } = await supabase
        .from('evaluations')
        .select('*, items:evaluation_items(*)')
        .order('period_start', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (moduleName === 'sedaya_offline_events') {
      const { data, error } = await supabase
        .from('events')
        .select('*, pic:profiles(*), project:projects(*)')
        .order('start_date', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (moduleName === 'sedaya_sales_support') {
      const { data, error } = await supabase
        .from('sales_support_requests')
        .select('*, pic:profiles(*), project:projects(*)')
        .order('request_date', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (moduleName === 'sedaya_sosialisasi') {
      const { data, error } = await supabase
        .from('sosialisasi_assists')
        .select('*, pic:profiles(*), project:projects(*)')
        .order('activity_date', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: data || [] });
    }

    if (moduleName === 'sedaya_marketing_props') {
      const { data, error } = await supabase
        .from('marketing_props')
        .select('*, pic:profiles(*), project:projects(*)')
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data: data || [] });
    }

    return NextResponse.json({ success: false, error: 'Unknown module' }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { module: moduleName, item, items } = body;
    const supabase = await createClient();

    if (moduleName === 'sedaya_activities') {
      const target = item || (Array.isArray(items) ? items : null);
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      const sanitizeActivity = (a: Record<string, unknown>) => {
        const copy = { ...a };
        delete copy.pic;
        delete copy.project;
        return copy;
      };

      const payload = Array.isArray(target) ? target.map(sanitizeActivity) : sanitizeActivity(target);

      const { data, error } = await supabase
        .from('daily_activities')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (moduleName === 'sedaya_unit_snapshots') {
      const target = item || items;
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      let rows: unknown[] = [];
      if (Array.isArray(target)) {
        rows = target;
      } else if (typeof target === 'object') {
        if ('project_id' in target) {
          rows = [target];
        } else {
          Object.values(target).forEach((val) => {
            if (Array.isArray(val)) rows.push(...val);
          });
        }
      }

      if (rows.length === 0) return NextResponse.json({ success: true, message: 'No rows to upsert' });

      const { data, error } = await supabase
        .from('unit_snapshots')
        .upsert(rows, { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (moduleName === 'sedaya_kos_snapshots') {
      const target = item || items;
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      let rows: unknown[] = [];
      if (Array.isArray(target)) {
        rows = target;
      } else if (typeof target === 'object') {
        if ('project_id' in target) {
          rows = [target];
        } else {
          Object.values(target).forEach((val) => {
            if (Array.isArray(val)) rows.push(...val);
          });
        }
      }

      if (rows.length === 0) return NextResponse.json({ success: true, message: 'No rows to upsert' });

      const { data, error } = await supabase
        .from('kos_snapshots')
        .upsert(rows, { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (moduleName === 'sedaya_content_items') {
      const target = item || (Array.isArray(items) ? items : null);
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      const sanitizeContent = (c: Record<string, unknown>) => {
        const copy = { ...c };
        delete copy.pic;
        delete copy.project;
        return copy;
      };

      const payload = Array.isArray(target) ? target.map(sanitizeContent) : sanitizeContent(target);

      const { data, error } = await supabase
        .from('content_items')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (moduleName === 'sedaya_marketing_plans') {
      const target = item || (Array.isArray(items) ? items : null);
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      const planList = Array.isArray(target) ? target : [target];
      const plansPayload: Record<string, unknown>[] = [];
      const itemsPayload: Record<string, unknown>[] = [];

      for (const p of planList) {
        const planCopy = { ...p };
        const rawItems = Array.isArray(planCopy.items) ? planCopy.items : [];
        delete planCopy.items;
        delete planCopy.creator;
        plansPayload.push(planCopy);

        for (const it of rawItems) {
          const itemCopy = { ...it };
          delete itemCopy.pic;
          delete itemCopy.project;
          itemsPayload.push(itemCopy);
        }
      }

      const { error: planError } = await supabase
        .from('marketing_plans')
        .upsert(plansPayload, { onConflict: 'id' });

      if (planError) {
        return NextResponse.json({ success: false, error: planError.message }, { status: 400 });
      }

      if (itemsPayload.length > 0) {
        const { error: itemsError } = await supabase
          .from('plan_items')
          .upsert(itemsPayload, { onConflict: 'id' });
        if (itemsError) {
          return NextResponse.json({ success: false, error: itemsError.message }, { status: 400 });
        }
      }

      return NextResponse.json({ success: true, plans: plansPayload.length, items: itemsPayload.length });
    }

    if (moduleName === 'sedaya_evaluations') {
      const target = item || (Array.isArray(items) ? items : null);
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      const evalList = Array.isArray(target) ? target : [target];
      const evalsPayload: Record<string, unknown>[] = [];
      const itemsPayload: Record<string, unknown>[] = [];

      for (const ev of evalList) {
        const evalCopy = { ...ev };
        const rawItems = Array.isArray(evalCopy.items) ? evalCopy.items : [];
        delete evalCopy.items;
        evalsPayload.push(evalCopy);

        for (const it of rawItems) {
          itemsPayload.push({ ...it });
        }
      }

      const { error: evalError } = await supabase
        .from('evaluations')
        .upsert(evalsPayload, { onConflict: 'id' });

      if (evalError) {
        return NextResponse.json({ success: false, error: evalError.message }, { status: 400 });
      }

      if (itemsPayload.length > 0) {
        const { error: itemsError } = await supabase
          .from('evaluation_items')
          .upsert(itemsPayload, { onConflict: 'id' });
        if (itemsError) {
          return NextResponse.json({ success: false, error: itemsError.message }, { status: 400 });
        }
      }

      return NextResponse.json({ success: true, evaluations: evalsPayload.length });
    }

    if (moduleName === 'sedaya_offline_events') {
      const target = item || (Array.isArray(items) ? items : null);
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      const sanitizeEvent = (e: Record<string, unknown>) => {
        const copy = { ...e };
        delete copy.pic;
        delete copy.project;
        return copy;
      };

      const payload = Array.isArray(target) ? target.map(sanitizeEvent) : sanitizeEvent(target);

      const { data, error } = await supabase
        .from('events')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (moduleName === 'sedaya_sales_support') {
      const target = item || (Array.isArray(items) ? items : null);
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      const sanitizeSupport = (s: Record<string, unknown>) => {
        const copy = { ...s };
        delete copy.pic;
        delete copy.project;
        return copy;
      };

      const payload = Array.isArray(target) ? target.map(sanitizeSupport) : sanitizeSupport(target);

      const { data, error } = await supabase
        .from('sales_support_requests')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (moduleName === 'sedaya_sosialisasi') {
      const target = item || (Array.isArray(items) ? items : null);
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      const sanitizeSos = (s: Record<string, unknown>) => {
        const copy = { ...s };
        delete copy.pic;
        delete copy.project;
        return copy;
      };

      const payload = Array.isArray(target) ? target.map(sanitizeSos) : sanitizeSos(target);

      const { data, error } = await supabase
        .from('sosialisasi_assists')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (moduleName === 'sedaya_marketing_props') {
      const target = item || (Array.isArray(items) ? items : null);
      if (!target) return NextResponse.json({ success: false, error: 'Missing item' }, { status: 400 });

      const sanitizeProp = (p: Record<string, unknown>) => {
        const copy = { ...p };
        delete copy.pic;
        delete copy.project;
        return copy;
      };

      const payload = Array.isArray(target) ? target.map(sanitizeProp) : sanitizeProp(target);

      const { data, error } = await supabase
        .from('marketing_props')
        .upsert(payload, { onConflict: 'id' })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: true, message: 'Received' });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
