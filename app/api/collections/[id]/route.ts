import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isVerifiedAdminRequest } from '@/lib/api/is-verified-admin-request';

const BG_MAP: Record<string, string> = {
  'а': 'a',  'б': 'b',  'в': 'v',  'г': 'g',  'д': 'd',
  'е': 'e',  'ж': 'j',  'з': 'z',  'и': 'i',  'й': 'y',
  'к': 'k',  'л': 'l',  'м': 'm',  'н': 'n',  'о': 'o',
  'п': 'p',  'р': 'r',  'с': 's',  'т': 't',  'у': 'u',
  'ф': 'f',  'х': 'h',  'ц': 'c',  'ч': 'ch', 'ш': 'sh',
  'щ': 'sht','ъ': 'a',  'ь': 'y',  'ю': 'yu', 'я': 'q',
};

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .split('')
    .map((ch) => BG_MAP[ch] ?? ch)
    .join('')
    .replace(/[^a-z0-9]+/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isVerifiedAdminRequest(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, description, imageurl, sortorder, isactive, showonindex } = body;

    if (showonindex) {
      const { count, error: countError } = await supabaseAdmin
        .from('collections')
        .select('*', { count: 'exact', head: true })
        .eq('showonindex', true)
        .neq('collectionid', id);

      if (!countError && count !== null && count >= 3) {
        return NextResponse.json({ error: 'Maximum of 3 collections can be visible on the index page.' }, { status: 400 });
      }
    }

    const { data, error } = await supabaseAdmin
      .from('collections')
      .update({
        ...(name != null && { name: name.trim(), slug: slugify(name) }),
        ...(description !== undefined && { description }),
        ...(imageurl !== undefined && { imageurl }),
        ...(sortorder !== undefined && { sortorder }),
        ...(isactive !== undefined && { isactive }),
        ...(showonindex !== undefined && { showonindex }),
        updatedat: new Date().toISOString(),
      })
      .eq('collectionid', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, collection: data });
  } catch (error) {
    console.error('Failed to update collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isVerifiedAdminRequest(_request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('collections')
      .delete()
      .eq('collectionid', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete collection:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
