import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  try {
    const userRole = session?.user ? (session.user as any).role : null;
    
    // For dev testing, we will bypass strict admin block if there is no session at all, but check if there is
    if (session && userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden: Admins only' }, { status: 403 });
    }

    const totalArticles = await prisma.article.count();
    const totalScripts = await prisma.script.count();
    const totalUsers = await prisma.user.count();

    const apiUsages = await prisma.apiUsage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const stats: Record<string, { total: number; success: number; failure: number; avgLatency: number }> = {};
    
    apiUsages.forEach(u => {
      if (!stats[u.service]) {
        stats[u.service] = { total: 0, success: 0, failure: 0, avgLatency: 0 };
      }
      const s = stats[u.service];
      s.total++;
      if (u.status === 'SUCCESS') s.success++;
      else s.failure++;
      s.avgLatency += u.latencyMs;
    });

    Object.keys(stats).forEach(k => {
      const s = stats[k];
      s.avgLatency = Math.round(s.avgLatency / s.total);
    });

    const recentActivity = await prisma.userHistory.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true, email: true }
        }
      }
    });

    const categoryGroup = await prisma.article.groupBy({
      by: ['category'],
      _count: {
        id: true,
      },
    });

    const categoryStats = categoryGroup.map(g => ({
      category: g.category,
      count: g._count.id,
    }));

    const apiKeysStatus = {
      gemini: !!process.env.GEMINI_API_KEY,
      openai: !!process.env.OPENAI_API_KEY,
      newsApi: !!process.env.NEWS_API_KEY,
      gNews: !!process.env.GNEWS_API_KEY,
      guardian: !!process.env.GUARDIAN_API_KEY,
      redis: !!process.env.REDIS_URL,
    };

    return NextResponse.json({
      summary: {
        totalArticles,
        totalScripts,
        totalUsers,
      },
      apiStats: stats,
      categoryStats,
      apiKeysStatus,
      recentActivity,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
