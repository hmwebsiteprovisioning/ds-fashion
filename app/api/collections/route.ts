import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isVerifiedAdminRequest } from '@/lib/api/is-verified-admin-request';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get('includeInactive') === 'true'
      && (await isVerifiedAdminRequest(request));

    let query = supabaseAdmin.from('collections').select('*').order('sortorder', { ascending: true });

    if (!includeInactive) {
      query = query.eq('isactive', true);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, collections: data ?? [] });
  } catch (error) {
    console.error('Failed to fetch collections:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isVerifiedAdminRequest(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, description, imageurl, sortorder, isactive, showonindex } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    if (showonindex) {
      const { count, error: countError } = await supabaseAdmin
        .from('collections')
        .select('*', { count: 'exact', head: true })
        .eq('showonindex', true);

      if (!countError && count !== null && count >= 3) {
        return NextResponse.json({ error: 'Maximum of 3 collections can be visible on the index page.' }, { status: 400 });
      }
    }

    const finalSlug = (slug?.trim() || slugify(name)).toLowerCase();

    const { data, error } = await supabaseAdmin
      .from('collections')
      .insert({
        name: name.trim(),
        slug: finalSlug,
        description: description || null,
        imageurl: imageurl || null,
        sortorder: sortorder ?? 0,
        isactive: isactive ?? true,
        showonindex: showonindex ?? false,
        updatedat: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, collection: data });
  } catch (error) {
    console.error('Failed to create collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
