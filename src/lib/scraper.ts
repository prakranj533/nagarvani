// News Scraper Service
// Fetches news from RSS feeds and public APIs

export interface ScrapedNewsItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  source: string;
  sourceUrl: string;
  category?: string;
  imageUrl?: string;
  location?: {
    city?: string;
    state?: string;
    pincode?: string;
  };
}

export interface NewsSource {
  id: string;
  name: string;
  url: string;
  type: "rss" | "api";
  category: string;
  location?: string;
  enabled: boolean;
}

// Pre-configured news sources (Indian news outlets)
export const DEFAULT_NEWS_SOURCES: NewsSource[] = [
  {
    id: "google_news_india",
    name: "Google News - India",
    url: "https://news.google.com/rss/topics/CAAqJQgKIh9DQkFTRWFvS0lHb1pDVEVTZFhKb2IyOG9hV1JsTURJMU1EQXVhWUl5L29lQ1Z3Y0d4T1lXbHVlQ29BT0RnNWVDSXRDaG9GWkVRM01EUXdDaGh0VUdsMGNISnZaMlZ6YUNJdENna0tFWE5sYzNOcGIyNUpTVTVGWkhrS0tHWnZjbVZ6YUNJdEtqWkVSR2hyYjJ4dmIyY3F8RU5HR0xJU0h8aW4",
    type: "rss",
    category: "national",
    enabled: true,
  },
  {
    id: "toi_delhi",
    name: "Times of India - Delhi",
    url: "https://timesofindia.indiatimes.com/rssfeeds/-2128839595.cms",
    type: "rss",
    category: "local",
    location: "Delhi",
    enabled: true,
  },
  {
    id: "toi_mumbai",
    name: "Times of India - Mumbai",
    url: "https://timesofindia.indiatimes.com/rssfeeds/-2128839597.cms",
    type: "rss",
    category: "local",
    location: "Mumbai",
    enabled: true,
  },
  {
    id: "ndtv_india",
    name: "NDTV - India",
    url: "https://feeds.feedburner.com/ndtvnews-india-news",
    type: "rss",
    category: "national",
    enabled: true,
  },
  {
    id: "indian_express",
    name: "Indian Express",
    url: "https://indianexpress.com/feed/",
    type: "rss",
    category: "national",
    enabled: true,
  },
  {
    id: "hindustan_times",
    name: "Hindustan Times",
    url: "https://www.hindustantimes.com/rss/topn/rssfeed.xml",
    type: "rss",
    category: "national",
    enabled: true,
  },
];

// Sample scraped data (simulating real scraped content)
export const SAMPLE_SCRAPED_NEWS: ScrapedNewsItem[] = [
  {
    id: "scraped-1",
    title: "Delhi CM announces free electricity scheme extension",
    description: "The Delhi government has extended the free electricity scheme for consumers using up to 200 units per month. The scheme will now continue for the next financial year.",
    link: "https://example.com/news/1",
    pubDate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: "Times of India",
    sourceUrl: "https://timesofindia.indiatimes.com",
    category: "government",
    imageUrl: "https://images.unsplash.com/photo-1566836610593-62a64888a216?w=800",
    location: { city: "Delhi", state: "Delhi", pincode: "110001" },
  },
  {
    id: "scraped-2",
    title: "Mumbai Metro Line 3 construction reaches 80% completion",
    description: "The much-awaited Colaba-Bandra-SEEPZ Metro Line 3 has reached 80% completion. Officials say the line is expected to open for public use by early 2025.",
    link: "https://example.com/news/2",
    pubDate: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    source: "Hindustan Times",
    sourceUrl: "https://hindustantimes.com",
    category: "infrastructure",
    imageUrl: "https://images.unsplash.com/photo-1565622871630-8e453c4b6b67?w=800",
    location: { city: "Mumbai", state: "Maharashtra", pincode: "400001" },
  },
  {
    id: "scraped-3",
    title: "Bengaluru traffic police introduces AI-based signal management",
    description: "In a first-of-its-kind initiative, Bengaluru traffic police have deployed AI-powered traffic signal management at 50 major junctions to reduce congestion.",
    link: "https://example.com/news/3",
    pubDate: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    source: "NDTV",
    sourceUrl: "https://ndtv.com",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1565622871630-8e453c4b6b67?w=800",
    location: { city: "Bengaluru", state: "Karnataka", pincode: "560001" },
  },
  {
    id: "scraped-4",
    title: "Chennai Corporation announces new waste segregation rules",
    description: "Chennai residents will now have to segregate waste into 5 categories instead of 2. The new rules will be effective from next month with fines for non-compliance.",
    link: "https://example.com/news/4",
    pubDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    source: "The Hindu",
    sourceUrl: "https://thehindu.com",
    category: "environment",
    imageUrl: "https://images.unsplash.com/photo-1530587191325-3db32d826c9d?w=800",
    location: { city: "Chennai", state: "Tamil Nadu", pincode: "600001" },
  },
  {
    id: "scraped-5",
    title: "PM Modi inaugurates new AIIMS in Gujarat",
    description: "Prime Minister Narendra Modi inaugurated a new AIIMS hospital in Rajkot, Gujarat. The 750-bed facility will provide tertiary healthcare services to Saurashtra region.",
    link: "https://example.com/news/5",
    pubDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    source: "Indian Express",
    sourceUrl: "https://indianexpress.com",
    category: "health",
    imageUrl: "https://images.unsplash.com/photo-1587351021759-3e566b066c11?w=800",
    location: { city: "Rajkot", state: "Gujarat" },
  },
  {
    id: "scraped-6",
    title: "Hyderabad's ORR to get solar-powered street lighting",
    description: "The Outer Ring Road in Hyderabad will soon have solar-powered LED street lights. The project aims to reduce carbon footprint and save electricity costs.",
    link: "https://example.com/news/6",
    pubDate: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    source: "Deccan Chronicle",
    sourceUrl: "https://deccanchronicle.com",
    category: "infrastructure",
    imageUrl: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800",
    location: { city: "Hyderabad", state: "Telangana", pincode: "500001" },
  },
  {
    id: "scraped-7",
    title: "Pune Metro: Two new stations to open next week",
    description: "Pune Metro Rail Corporation announced that two new stations on the Aqua Line will be inaugurated next week, connecting more areas of the city.",
    link: "https://example.com/news/7",
    pubDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    source: "Pune Mirror",
    sourceUrl: "https://punemirror.com",
    category: "transport",
    imageUrl: "https://images.unsplash.com/photo-1565622871630-8e453c4b6b67?w=800",
    location: { city: "Pune", state: "Maharashtra", pincode: "411001" },
  },
  {
    id: "scraped-8",
    title: "Kolkata Police launches mobile app for citizen services",
    description: "Kolkata Police has launched a new mobile application allowing citizens to file complaints, track FIR status, and access emergency services.",
    link: "https://example.com/news/8",
    pubDate: new Date(Date.now() - 60 * 60 * 60 * 1000).toISOString(),
    source: "Telegraph India",
    sourceUrl: "https://telegraphindia.com",
    category: "technology",
    imageUrl: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800",
    location: { city: "Kolkata", state: "West Bengal", pincode: "700001" },
  },
];

// Function to parse RSS feed (simulated for demo)
export async function scrapeNewsFromSource(source: NewsSource): Promise<ScrapedNewsItem[]> {
  // In a real implementation, this would:
  // 1. Fetch the RSS feed using fetch()
  // 2. Parse XML using DOMParser or xml2js
  // 3. Extract title, description, link, pubDate
  // 4. Return formatted items
  
  // For demo, return filtered sample data based on source
  return SAMPLE_SCRAPED_NEWS.filter(item => {
    if (source.location) {
      return item.location?.city?.toLowerCase().includes(source.location.toLowerCase()) ||
             item.title.toLowerCase().includes(source.location.toLowerCase());
    }
    return true;
  }).map(item => ({
    ...item,
    source: source.name,
    sourceUrl: source.url,
  }));
}

// Scrape all enabled sources
export async function scrapeAllNews(): Promise<ScrapedNewsItem[]> {
  const enabledSources = DEFAULT_NEWS_SOURCES.filter(s => s.enabled);
  
  const allNews: ScrapedNewsItem[] = [];
  
  for (const source of enabledSources) {
    try {
      const news = await scrapeNewsFromSource(source);
      allNews.push(...news);
    } catch (error) {
      console.error(`Failed to scrape ${source.name}:`, error);
    }
  }
  
  // Sort by date (newest first)
  return allNews.sort((a, b) => 
    new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
  );
}

// Filter news by location
export function filterNewsByLocation(
  news: ScrapedNewsItem[], 
  pincode: string, 
  city?: string
): ScrapedNewsItem[] {
  return news.filter(item => {
    // Exact pincode match
    if (item.location?.pincode === pincode) return true;
    
    // City match
    if (city && item.location?.city?.toLowerCase() === city.toLowerCase()) return true;
    
    // Content contains city name
    if (city && (
      item.title.toLowerCase().includes(city.toLowerCase()) ||
      item.description.toLowerCase().includes(city.toLowerCase())
    )) return true;
    
    return false;
  });
}

// Search news
export function searchNews(news: ScrapedNewsItem[], query: string): ScrapedNewsItem[] {
  const q = query.toLowerCase();
  return news.filter(item =>
    item.title.toLowerCase().includes(q) ||
    item.description.toLowerCase().includes(q) ||
    item.category?.toLowerCase().includes(q) ||
    item.source.toLowerCase().includes(q)
  );
}

// Format relative time
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (seconds < 60) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}
