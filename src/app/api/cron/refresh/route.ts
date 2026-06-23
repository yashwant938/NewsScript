import { NextRequest, NextResponse } from 'next/server';
import { NewsAggregationService } from '@/lib/services/news';

const CATEGORIES = ['overall', 'technology', 'sports', 'business', 'entertainment', 'science', 'world'];

export async function GET(req: NextRequest) {
  // Security check: Verify Cron Secret if set in production
  if (process.env.NODE_ENV === 'production' && process.env.CRON_SECRET) {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  console.log('Cron Job Triggered: Refreshing all news categories...');
  const startTime = Date.now();
  const results: Record<string, number> = {};

  try {
    // Refresh categories sequentially to avoid rate-limiting spikes
    for (const category of CATEGORIES) {
      const articles = await NewsAggregationService.getTopTrendingNews(category, true);
      results[category] = articles.length;
      console.log(`- Refreshed [${category}]: loaded ${articles.length} articles.`);
    }

    return NextResponse.json({
      success: true,
      message: 'All categories aggregated successfully.',
      durationMs: Date.now() - startTime,
      results,
    });
  } catch (error: any) {
    console.error('Cron Aggregation failed:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Cron job aggregation failed',
    }, { status: 500 });
  }
}
