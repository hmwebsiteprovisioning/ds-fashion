import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { isVerifiedAdminRequest } from '@/lib/api/is-verified-admin-request';

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
    const { name, slug, description, imageurl, sortorder, isactive } = body;

    const { data, error } = await supabaseAdmin
      .from('collections')
      .update({
        ...(name != null && { name: name.trim() }),
        ...(slug != null && { slug: slug.trim().toLowerCase() }),
        ...(description !== undefined && { description }),
        ...(imageurl !== undefined && { imageurl }),
        ...(sortorder !== undefined && { sortorder }),
        ...(isactive !== undefined && { isactive }),
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
