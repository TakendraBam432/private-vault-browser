import { useEffect, useRef } from "react";

interface WebViewProps {
  url: string;
  onLoadStart?: () => void;
  onLoadEnd?: (title: string) => void;
}

export function WebView({ url, onLoadStart, onLoadEnd }: WebViewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (onLoadStart) {
      onLoadStart();
    }

    const iframe = iframeRef.current;
    if (iframe) {
      const handleLoad = () => {
        try {
          const title = iframe.contentDocument?.title || url;
          onLoadEnd?.(title);
        } catch (error) {
          // Cross-origin restrictions
          onLoadEnd?.(url);
        }
      };

      iframe.addEventListener("load", handleLoad);
      return () => iframe.removeEventListener("load", handleLoad);
    }
  }, [url, onLoadStart, onLoadEnd]);

  return (
    <iframe
      ref={iframeRef}
      src={url}
      className="w-full h-full border-0"
      sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-downloads"
      title="Browser Content"
    />
  );
}
