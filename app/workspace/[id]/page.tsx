import { Metadata } from 'next';
import { redirect, notFound } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { UserSessionData, userSessionOptions } from '@/lib/user-session';
import { query } from '@/lib/db';
import WorkspaceItemClient from './WorkspaceItemClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Workspace Item | VCM Suite',
  robots: { index: false, follow: false },
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WorkspaceItemPage({ params }: Props) {
  const session = await getIronSession<UserSessionData>(await cookies(), userSessionOptions);
  
  if (!session.isLoggedIn || !session.userId) {
    redirect('/login?redirect=/workspace');
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
    notFound();
  }

  const row = result.rows[0];
  const { tags_json, ...rest } = row;
  return <WorkspaceItemClient item={{ ...rest, tags: Array.isArray(tags_json) ? tags_json : [] }} />;
}
