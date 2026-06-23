import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { AdminSessionData, sessionOptions } from '@/lib/admin-session';
import { publishArticle, unpublishArticle } from '@/lib/articleGenerator';
import { pingSearchEngines } from '@/lib/searchPings';

export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<AdminSessionData>(await cookies(), sessionOptions);
    if (!session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { slug, action } = body;

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json(
        { error: 'slug is required' },
        { status: 400 }
      );
    }

    if (action !== 'publish' && action !== 'unpublish') {
      return NextResponse.json(
        { error: 'action must be "publish" or "unpublish"' },
        { status: 400 }
      );
    }

    let success: boolean;
    if (action === 'publish') {
      success = await publishArticle(slug);
    } else {
      success = await unpublishArticle(slug);
    }

    if (!success) {
      return NextResponse.json(
        { error: `Article not found or already ${action}ed: ${slug}` },
        { status: 404 }
      );
    }

    if (action === 'publish') {
      pingSearchEngines(slug).catch((err) =>
        console.warn('[publish] search ping error:', err)
      );
    }

    return NextResponse.json({
      success: true,
      slug,
      action,
    });

  } catch (error) {
    console.error('Article publish error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update article' },
      { status: 500 }
    );
  }
}
