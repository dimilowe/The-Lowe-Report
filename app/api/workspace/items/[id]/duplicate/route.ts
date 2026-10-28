import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { UserSessionData, userSessionOptions } from '@/lib/user-session';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<UserSessionData>(await cookies(), userSessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    let versionNote: string | null = null;
    try {
      const body = await request.json();
      if (typeof body?.version_note === 'string') {
        const trimmed = body.version_note.trim();
        versionNote = trimmed ? trimmed.slice(0, 280) : null;
      }
    } catch {
      // Optional JSON body; ignore parse failures for empty requests.
    }

    const sourceResult = await query(
      `SELECT id, user_id, title, type, origin_cloud_id, cloud_id, workflow_id,
              preview_text, payload_json, thumbnail_url, file_url
       FROM workspace_items
       WHERE id = $1 AND user_id = $2`,
      [id, session.userId]
    );

    if (sourceResult.rows.length === 0) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    const source = sourceResult.rows[0];
    const versionGroupId = source.payload_json?.version_group_id || source.id;

    const maxVersionResult = await query(
      `SELECT COALESCE(MAX(COALESCE(NULLIF(payload_json->>'version_number', '')::int, 1)), 1) AS max_version
       FROM workspace_items
       WHERE user_id = $1
         AND COALESCE(NULLIF(payload_json->>'version_group_id', ''), id::text) = $2`,
      [session.userId, versionGroupId]
    );

    const nextVersion = (parseInt(maxVersionResult.rows[0]?.max_version || '1', 10) || 1) + 1;
    const nextPayload = {
      ...(source.payload_json || {}),
      version_group_id: versionGroupId,
      version_number: nextVersion,
      duplicated_from_item_id: source.id,
      ...(versionNote ? { version_note: versionNote } : {}),
    };

    const result = await query(
      `INSERT INTO workspace_items
       (user_id, title, type, origin_cloud_id, cloud_id, tool_id, workflow_id, preview_text, payload_json, thumbnail_url, file_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
       RETURNING id, title, type, origin_cloud_id, cloud_id, is_starred, preview_text,
                 thumbnail_url, file_url, created_at, updated_at, last_opened_at,
                 COALESCE(payload_json->>'folder', NULL) AS folder,
                 COALESCE(payload_json->'tags', '[]'::jsonb) AS tags_json,
                 COALESCE(NULLIF(payload_json->>'version_group_id', ''), id::text) AS version_group_id,
                 COALESCE(NULLIF(payload_json->>'version_number', '')::int, 1) AS version_number`,
      [
        session.userId,
        `${source.title} (v${nextVersion})`,
        source.type,
        source.origin_cloud_id || null,
        source.cloud_id || null,
        null,
        source.workflow_id || null,
        source.preview_text || null,
        JSON.stringify(nextPayload),
        source.thumbnail_url || null,
        source.file_url || null,
      ]
    );

    const row = result.rows[0];
    const { tags_json, ...rest } = row;

    return NextResponse.json(
      {
        ...rest,
        tags: Array.isArray(tags_json) ? tags_json : [],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error duplicating workspace item:', error);
    return NextResponse.json({ error: 'Failed to duplicate item' }, { status: 500 });
  }
}
