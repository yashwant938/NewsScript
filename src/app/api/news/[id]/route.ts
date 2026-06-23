import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await getServerSession(authOptions);

  try {
    const userId = session?.user ? (session.user as any).id : null;

    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Check if saved
    let isSaved = false;
    if (userId) {
      const savedRecord = await prisma.savedNews.findUnique({
        where: {
          userId_articleId: {
            userId,
            articleId: id,
          },
        },
      });
      isSaved = !!savedRecord;

      // Add to user view history
      await prisma.userHistory.create({
        data: {
          userId,
          action: 'VIEW_ARTICLE',
          details: `Viewed news article: ${article.title}`,
        },
      });
    }

    // Get related news (3 articles in the same category, excluding this one)
    const related = await prisma.article.findMany({
      where: {
        category: article.category,
        id: { not: id },
      },
      take: 3,
      orderBy: { trendingScore: 'desc' },
    });

    // Check if script exists
    const script = await prisma.script.findFirst({
      where: { articleId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      article,
      isSaved,
      related,
      hasScript: !!script,
      scriptId: script ? script.id : null,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
