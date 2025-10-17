import { motion } from "framer-motion";
import { ExternalLink, Search, Database } from "lucide-react";
import { SearchResult } from "@/lib/search";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface SearchResultsProps {
  query: string;
  results: SearchResult[];
  onSelectResult: (url: string) => void;
  onOpenIndexManager?: () => void;
}

export function SearchResults({ query, results, onSelectResult, onOpenIndexManager }: SearchResultsProps) {
  if (!results.length) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background p-8">
        <div className="text-center space-y-3 max-w-md">
          <Search className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <h3 className="text-lg font-semibold">No results found</h3>
          <p className="text-sm text-muted-foreground">
            No results for "{query}". Build your search index to find what you're looking for.
          </p>
          {onOpenIndexManager && (
            <Button onClick={onOpenIndexManager} className="mt-4">
              <Database className="w-4 h-4 mr-2" />
              Manage Search Index
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-background p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Search info */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm text-muted-foreground">
            About {results.length} results for "{query}"
          </h2>
          {onOpenIndexManager && (
            <Button variant="outline" size="sm" onClick={onOpenIndexManager}>
              <Database className="w-4 h-4 mr-2" />
              Index
            </Button>
          )}
        </div>

        {/* Results */}
        <div className="space-y-4">
          {results.map((result, index) => (
            <motion.div
              key={result.url}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="cursor-pointer hover:bg-accent/50 transition-colors border-border/50"
                onClick={() => onSelectResult(result.url)}
              >
                <CardContent className="p-4 space-y-2">
                  {/* URL */}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span className="truncate">{result.url}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-medium text-primary hover:underline">
                    {result.title}
                  </h3>

                  {/* Snippet */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {result.snippet}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
