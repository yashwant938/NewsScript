import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { AiScriptService } from '@/lib/services/ai';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  try {
    const userId = session?.user ? (session.user as any).id : null;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const bookmarks = await prisma.bookmarkedScript.findMany({
      where: { userId },
      include: {
        script: {
          include: {
            article: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(bookmarks.map(b => b.script));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const body = await req.json();
  const { articleId, regenerate = false } = body;

  if (!articleId) {
    return NextResponse.json({ error: 'articleId is required' }, { status: 400 });
  }

  try {
    const userId = session?.user ? (session.user as any).id : null;

    // Check if script already exists and we are not forcing regeneration
    if (!regenerate) {
      const existingScript = await prisma.script.findFirst({
        where: { articleId },
        orderBy: { createdAt: 'desc' },
      });

      if (existingScript) {
        // Record user history if authenticated
        if (userId) {
          await prisma.userHistory.create({
            data: {
              userId,
              action: 'VIEW_SCRIPT',
              details: `Viewed script for article: ${articleId}`,
            },
          });
        }
        return NextResponse.json({ script: existingScript, cached: true });
      }
    }

    // Fetch the article details
    const article = await prisma.article.findUnique({
      where: { id: articleId },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Call LLM generator
    const scriptContent = await AiScriptService.generateScript(
      article.title,
      article.content || article.description || '',
      article.sourceName,
      article.category
    );

    // Save script in DB
    const script = await prisma.script.create({
      data: {
        articleId,
        content: JSON.stringify(scriptContent),
      },
    });

    // Record user history if authenticated
    if (userId) {
      await prisma.userHistory.create({
        data: {
          userId,
          action: 'GENERATE_SCRIPT',
          details: `Generated script for article: ${article.title}`,
        },
      });
    }

    return NextResponse.json({ script, cached: false });
  } catch (error: any) {
    console.error('Error in /api/scripts POST:', error);
    return NextResponse.json({ error: error.message || 'Failed generating script' }, { status: 500 });
  }
}
