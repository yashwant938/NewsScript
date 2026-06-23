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

    // Check if script exists
    const script = await prisma.script.findUnique({
      where: { id },
    });

    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    // Check if already bookmarked
    const existing = await prisma.bookmarkedScript.findUnique({
      where: {
        userId_scriptId: {
          userId,
          scriptId: id,
        },
      },
    });

    if (existing) {
      // Unbookmark
      await prisma.bookmarkedScript.delete({
        where: {
          userId_scriptId: {
            userId,
            scriptId: id,
          },
        },
      });

      await prisma.userHistory.create({
        data: {
          userId,
          action: 'UNBOOKMARK_SCRIPT',
          details: `Unbookmarked script ID: ${id}`,
        },
      });

      return NextResponse.json({ bookmarked: false });
    } else {
      // Bookmark
      await prisma.bookmarkedScript.create({
        data: {
          userId,
          scriptId: id,
        },
      });

      await prisma.userHistory.create({
        data: {
          userId,
          action: 'BOOKMARK_SCRIPT',
          details: `Bookmarked script ID: ${id}`,
        },
      });

      return NextResponse.json({ bookmarked: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
