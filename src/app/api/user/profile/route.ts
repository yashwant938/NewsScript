import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  try {
    const userId = session?.user ? (session.user as any).id : null;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch saved news
    const savedNews = await prisma.savedNews.findMany({
      where: { userId },
      include: {
        article: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch bookmarked scripts
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

    // Fetch history
    const history = await prisma.userHistory.findMany({
      where: { userId },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      user: {
        name: session?.user?.name,
        email: session?.user?.email,
      },
      savedArticles: savedNews.map(sn => sn.article),
      bookmarkedScripts: bookmarks.map(b => b.script),
      history,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
