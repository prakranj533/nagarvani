import { NextRequest, NextResponse } from "next/server";
import { 
  scrapeAllNews, 
  filterNewsByLocation, 
  searchNews,
  SAMPLE_SCRAPED_NEWS,
  type ScrapedNewsItem 
} from "@/lib/scraper";

// Cache scraped news for 15 minutes
let cachedNews: ScrapedNewsItem[] = [];
let lastScraped: number = 0;
const CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

export async function GET(req: NextRequest) {
  const pincode = req.nextUrl.searchParams.get("pincode");
  const city = req.nextUrl.searchParams.get("city");
  const search = req.nextUrl.searchParams.get("search");
  const category = req.nextUrl.searchParams.get("category");
  const source = req.nextUrl.searchParams.get("source");
  const refresh = req.nextUrl.searchParams.get("refresh") === "true";

  try {
    // Check if we need to refresh the cache
    const now = Date.now();
    if (refresh || cachedNews.length === 0 || (now - lastScraped) > CACHE_DURATION) {
      // In production, this would actually scrape the sources
      // For demo, we use the sample data
      cachedNews = [...SAMPLE_SCRAPED_NEWS];
      lastScraped = now;
    }

    let results = [...cachedNews];

    // Filter by location
    if (pincode || city) {
      results = filterNewsByLocation(results, pincode || "", city || undefined);
    }

    // Filter by category
    if (category) {
      results = results.filter(n => 
        n.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by source
    if (source) {
      results = results.filter(n => 
        n.source.toLowerCase().includes(source.toLowerCase())
      );
    }

    // Search
    if (search) {
      results = searchNews(results, search);
    }

    // Sort by date (newest first)
    results.sort((a, b) => 
      new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
    );

    // Get unique categories and sources for filters
    const categories = [...new Set(results.map(n => n.category).filter(Boolean))];
    const sources = [...new Set(results.map(n => n.source))];
    const cities = [...new Set(results.map(n => n.location?.city).filter(Boolean))];

    return NextResponse.json({
      total: results.length,
      data: results,
      meta: {
        categories,
        sources,
        cities,
        lastUpdated: new Date(lastScraped).toISOString(),
        isCached: !refresh && (now - lastScraped) < CACHE_DURATION,
      },
    });

  } catch (error) {
    console.error("News scraping error:", error);
    return NextResponse.json(
      { error: "Failed to fetch news", total: 0, data: [] },
      { status: 500 }
    );
  }
}

// Trigger manual refresh
export async function POST(req: NextRequest) {
  try {
    // Simulate scraping
    cachedNews = [...SAMPLE_SCRAPED_NEWS];
    lastScraped = Date.now();

    return NextResponse.json({
      success: true,
      message: "News refreshed successfully",
      totalArticles: cachedNews.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to refresh news" },
      { status: 500 }
    );
  }
}
