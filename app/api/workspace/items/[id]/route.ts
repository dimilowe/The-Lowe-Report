import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { UserSessionData, userSessionOptions } from '@/lib/user-session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<UserSessionData>(await cookies(), userSessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const result = await query(
      `UPDATE workspace_items 
       SET last_opened_at = NOW()
       WHERE id = $1 AND user_id = $2
       RETURNING id, title, type, origin_cloud_id, cloud_id, workflow_id, is_starred,
                 preview_text, payload_json, thumbnail_url, file_url, created_at, updated_at, last_opened_at,
                 COALESCE(payload_json->>'folder', NULL) AS folder,
                 COALESCE(payload_json->'tags', '[]'::jsonb) AS tags_json,
                 COALESCE(NULLIF(payload_json->>'version_group_id', ''), id::text) AS version_group_id,
                 COALESCE(NULLIF(payload_json->>'version_number', '')::int, 1) AS version_number`,
      [id, session.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const { tags_json, ...rest } = row;
    return NextResponse.json({
      ...rest,
      tags: Array.isArray(tags_json) ? tags_json : [],
    });
  } catch (error) {
    console.error('Error fetching workspace item:', error);
    return NextResponse.json({ error: 'Failed to fetch item' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<UserSessionData>(await cookies(), userSessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const updates: string[] = ['updated_at = NOW()'];
    const values: any[] = [];
    let paramIndex = 1;

    if (typeof body.is_starred === 'boolean') {
      updates.push(`is_starred = $${paramIndex}`);
      values.push(body.is_starred);
      paramIndex++;
    }

    if (typeof body.title === 'string' && body.title.trim()) {
      updates.push(`title = $${paramIndex}`);
      values.push(body.title.trim());
      paramIndex++;
    }

    const shouldUpdateFolder = body.folder !== undefined;
    const shouldUpdateTags = Array.isArray(body.tags);

    if (shouldUpdateFolder || shouldUpdateTags) {
      const existing = await query(
        `SELECT payload_json
         FROM workspace_items
         WHERE id = $1 AND user_id = $2`,
        [id, session.userId]
      );

      if (existing.rows.length === 0) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      const nextPayload = {
        ...(existing.rows[0]?.payload_json || {}),
      } as Record<string, unknown>;

      if (shouldUpdateFolder) {
        const folderValue = typeof body.folder === 'string' ? body.folder.trim() : '';
        if (folderValue) {
          nextPayload.folder = folderValue;
        } else {
          delete nextPayload.folder;
        }
      }

      if (shouldUpdateTags) {
        const normalizedTags = body.tags
          .map((tag: unknown) => (typeof tag === 'string' ? tag.trim().toLowerCase() : ''))
          .filter(Boolean)
          .slice(0, 20);
        if (normalizedTags.length > 0) {
          nextPayload.tags = normalizedTags;
        } else {
          delete nextPayload.tags;
        }
      }

      updates.push(`payload_json = $${paramIndex}`);
      values.push(JSON.stringify(nextPayload));
      paramIndex++;
    }

    if (updates.length === 1) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    values.push(id, session.userId);

    const result = await query(
      `UPDATE workspace_items 
       SET ${updates.join(', ')}
       WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}
       RETURNING id, title, type, origin_cloud_id, cloud_id, is_starred, preview_text,
                 thumbnail_url, file_url, created_at, updated_at, last_opened_at,
                 COALESCE(payload_json->>'folder', NULL) AS folder,
                 COALESCE(payload_json->'tags', '[]'::jsonb) AS tags_json,
                 COALESCE(NULLIF(payload_json->>'version_group_id', ''), id::text) AS version_group_id,
                 COALESCE(NULLIF(payload_json->>'version_number', '')::int, 1) AS version_number`,
      values
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const row = result.rows[0];
    const { tags_json, ...rest } = row;
    return NextResponse.json({
      ...rest,
      tags: Array.isArray(tags_json) ? tags_json : [],
    });
  } catch (error) {
    console.error('Error updating workspace item:', error);
    return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<UserSessionData>(await cookies(), userSessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const result = await query(
      `DELETE FROM workspace_items WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, session.userId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting workspace item:', error);
    return NextResponse.json({ error: 'Failed to delete item' }, { status: 500 });
  }
}
