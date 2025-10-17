import { useState } from "react";
import { Plus, Trash2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { storage, SearchIndex } from "@/lib/storage";
import { normalizeUrl } from "@/lib/search";

interface IndexManagerProps {
  onIndexUpdated: () => void;
}

export function IndexManager({ onIndexUpdated }: IndexManagerProps) {
  const [url, setUrl] = useState("");
  const [isIndexing, setIsIndexing] = useState(false);
  const [indexedSites, setIndexedSites] = useState<SearchIndex[]>([]);
  const { toast } = useToast();

  const loadIndexedSites = async () => {
    const sites = await storage.getSearchIndex();
    setIndexedSites(sites);
  };

  const indexWebsite = async () => {
    if (!url.trim()) return;

    setIsIndexing(true);
    const normalizedUrl = normalizeUrl(url);

    try {
      // Fetch and parse the webpage
      const response = await fetch(normalizedUrl);
      const html = await response.text();

      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1].trim() : normalizedUrl;

      // Extract text content (remove scripts, styles, tags)
      let content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      // Extract meta keywords
      const keywordsMatch = html.match(/<meta[^>]*name=["']keywords["'][^>]*content=["']([^"']+)["']/i);
      const keywords = keywordsMatch ? keywordsMatch[1].split(",").map(k => k.trim()) : [];

      // Add to index
      await storage.addToSearchIndex({
        url: normalizedUrl,
        title,
        content: content.slice(0, 10000), // Limit content size
        keywords,
        timestamp: Date.now(),
        lastIndexed: Date.now(),
      });

      toast({
        title: "Site indexed!",
        description: `Added ${title} to your search index`,
      });

      setUrl("");
      loadIndexedSites();
      onIndexUpdated();
    } catch (error) {
      toast({
        title: "Failed to index",
        description: "Could not fetch website. Check URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsIndexing(false);
    }
  };

  const removeFromIndex = async (url: string) => {
    const currentIndex = await storage.getSearchIndex();
    const newIndex = currentIndex.filter(item => item.url !== url);
    await storage.saveSearchIndex(newIndex);
    
    toast({
      title: "Removed from index",
      description: "Site removed from search engine",
    });

    loadIndexedSites();
    onIndexUpdated();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Build Your Search Index
        </h3>
        <p className="text-sm text-muted-foreground">
          Add websites to your private search engine. All data stays on your device.
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter website URL to index..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && indexWebsite()}
        />
        <Button 
          onClick={indexWebsite} 
          disabled={isIndexing || !url.trim()}
          className="flex-shrink-0"
        >
          {isIndexing ? (
            "Indexing..."
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Add
            </>
          )}
        </Button>
      </div>

      <div className="space-y-2">
        <Button 
          variant="outline" 
          onClick={loadIndexedSites}
          className="w-full"
        >
          Show Indexed Sites ({indexedSites.length})
        </Button>

        {indexedSites.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {indexedSites.map((site) => (
              <Card key={site.url} className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{site.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{site.url}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Indexed {new Date(site.lastIndexed).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={() => removeFromIndex(site.url)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {indexedSites.length === 0 && (
        <Card className="p-6 text-center space-y-2 bg-muted/50">
          <Globe className="w-12 h-12 mx-auto text-muted-foreground" />
          <h4 className="font-medium">No indexed sites yet</h4>
          <p className="text-sm text-muted-foreground">
            Add websites above to build your private search engine
          </p>
        </Card>
      )}
    </div>
  );
}
