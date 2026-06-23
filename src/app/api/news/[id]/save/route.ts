import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;
  const session = await getServerSession(authOptions);

  try {
    const userId = session?.user ? (session.user as any).id : null;
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if already saved
    const existing = await prisma.savedNews.findUnique({
      where: {
        userId_articleId: {
          userId,
          articleId: id,
        },
      },
    });

    if (existing) {
      // Unsave
      await prisma.savedNews.delete({
        where: {
          userId_articleId: {
            userId,
            articleId: id,
          },
        },
      });

      await prisma.userHistory.create({
        data: {
          userId,
          action: 'UNSAVE_NEWS',
          details: `Unsaved article ID: ${id}`,
        },
      });

      return NextResponse.json({ saved: false });
    } else {
      // Save
      await prisma.savedNews.create({
        data: {
          userId,
          articleId: id,
        },
      });

      await prisma.userHistory.create({
        data: {
          userId,
          action: 'SAVE_NEWS',
          details: `Saved article ID: ${id}`,
        },
      });

      return NextResponse.json({ saved: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
