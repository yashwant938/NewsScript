import { NextRequest, NextResponse } from 'next/server';
import { NewsAggregationService } from '@/lib/services/news';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || 'overall';
  const searchQuery = searchParams.get('search') || '';
  const forceRefresh = searchParams.get('forceRefresh') === 'true';

  try {
    if (searchQuery) {
      // Search database for matching articles
      const articles = await prisma.article.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery } },
            { description: { contains: searchQuery } },
            { content: { contains: searchQuery } },
          ],
        },
        orderBy: { trendingScore: 'desc' },
      });
      return NextResponse.json(articles);
    }

    const articles = await NewsAggregationService.getTopTrendingNews(category, forceRefresh);
    return NextResponse.json(articles);
  } catch (error: any) {
    console.error('Error in /api/news API:', error);
    return NextResponse.json({ error: error.message || 'Failed fetching news' }, { status: 500 });
  }
}
