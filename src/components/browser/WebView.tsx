import { useEffect, useRef } from "react";
import { Loader2, AlertCircle, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebViewProps {
  url: string;
  onLoad?: (title: string) => void;
  onError?: () => void;
}

export function WebView({ url, onLoad, onError }: WebViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
  }, [url]);

  const handleLoad = () => {
    setLoading(false);
    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        const title = iframe.contentDocument?.title || url;
        onLoad?.(title);
      }
    } catch (err) {
      console.error("Error accessing iframe:", err);
    }
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
    onError?.();
  };

  if (!url) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground/50" />
          <div>
            <h2 className="text-2xl font-semibold mb-2">Private Vault Browser</h2>
            <p className="text-muted-foreground">
              Enter a URL or search query to get started
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-background">
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="text-center space-y-3">
            <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
            <div>
              <h3 className="text-lg font-semibold mb-1">Cannot load page</h3>
              <p className="text-sm text-muted-foreground">
                This page cannot be displayed in the browser
              </p>
              <p className="text-xs text-muted-foreground/70 mt-2">
                Some sites may block embedding for security reasons
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WebView iframe */}
      <iframe
        ref={iframeRef}
        src={url}
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "w-full h-full border-0",
          (loading || error) && "invisible"
        )}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        title="Browser content"
      />
    </div>
  );
}

// Fix useState import
import { useState } from "react";
