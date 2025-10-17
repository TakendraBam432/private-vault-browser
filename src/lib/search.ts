// Local search engine with TF-IDF ranking
import { SearchIndex } from "./storage";

export interface SearchResult {
  url: string;
  title: string;
  score: number;
  snippet: string;
}

// Tokenize text into keywords
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2);
}

// Calculate TF-IDF score
function calculateScore(query: string, index: SearchIndex): number {
  const queryTokens = tokenize(query);
  const titleTokens = tokenize(index.title);
  const contentTokens = tokenize(index.content);
  const allTokens = [...titleTokens, ...contentTokens];

  let score = 0;

  queryTokens.forEach(qToken => {
    // Exact match in title = high score
    if (index.title.toLowerCase().includes(qToken)) {
      score += 10;
    }

    // Count occurrences in content
    const occurrences = allTokens.filter(t => t.includes(qToken)).length;
    score += occurrences;

    // Keyword match = bonus
    if (index.keywords.some(k => k.toLowerCase().includes(qToken))) {
      score += 5;
    }
  });

  return score;
}

// Generate snippet from content
function generateSnippet(content: string, query: string, maxLength: number = 150): string {
  const lowerContent = content.toLowerCase();
  const lowerQuery = query.toLowerCase();
  
  // Find first occurrence of any query term
  const queryTokens = tokenize(query);
  let snippetStart = 0;

  for (const token of queryTokens) {
    const index = lowerContent.indexOf(token);
    if (index !== -1) {
      snippetStart = Math.max(0, index - 50);
      break;
    }
  }

  let snippet = content.slice(snippetStart, snippetStart + maxLength);
  
  // Add ellipsis if truncated
  if (snippetStart > 0) snippet = "..." + snippet;
  if (snippetStart + maxLength < content.length) snippet = snippet + "...";

  return snippet.trim();
}

// Search the local index
export function searchIndex(query: string, index: SearchIndex[]): SearchResult[] {
  if (!query.trim()) return [];

  const results: SearchResult[] = [];

  index.forEach(item => {
    const score = calculateScore(query, item);
    
    if (score > 0) {
      results.push({
        url: item.url,
        title: item.title || item.url,
        score,
        snippet: generateSnippet(item.content, query),
      });
    }
  });

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, 50); // Return top 50 results
}

// Check if input is a URL
export function isUrl(input: string): boolean {
  // Check for common URL patterns
  const urlPattern = /^(https?:\/\/)|(www\.)/i;
  const domainPattern = /^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/;
  
  return urlPattern.test(input) || domainPattern.test(input);
}

// Normalize URL
export function normalizeUrl(input: string): string {
  let url = input.trim();
  
  // Add protocol if missing
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = "https://" + url;
  }
  
  return url;
}

// Extract domain from URL
export function getDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}
