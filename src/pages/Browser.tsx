import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCw, 
  Plus,
  Menu,
  Bookmark,
  History,
  Settings,
} from "lucide-react";
import { Browser as CapacitorBrowser } from "@capacitor/browser";
import { BrowserTab } from "@/components/browser/BrowserTab";
import { AddressBar } from "@/components/browser/AddressBar";
import { SearchResults } from "@/components/browser/SearchResults";
import { Button } from "@/components/ui/button";
import { storage, BrowserTab as TabType } from "@/lib/storage";
import { searchIndex, isUrl, normalizeUrl, SearchResult } from "@/lib/search";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function Browser() {
  const [tabs, setTabs] = useState<TabType[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");
  const [addressBarValue, setAddressBarValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const { toast } = useToast();

  // Initialize with one tab
  useEffect(() => {
    loadTabs();
  }, []);

  const loadTabs = async () => {
    const savedTabs = await storage.getTabs();
    if (savedTabs.length > 0) {
      setTabs(savedTabs);
      setActiveTabId(savedTabs[0].id);
      setAddressBarValue(savedTabs[0].url);
    } else {
      createNewTab();
    }
  };

  const saveTabs = async (newTabs: TabType[]) => {
    await storage.saveTabs(newTabs);
  };

  const createNewTab = () => {
    const newTab: TabType = {
      id: crypto.randomUUID(),
      url: "",
      title: "New Tab",
      timestamp: Date.now(),
    };
    const newTabs = [...tabs, newTab];
    setTabs(newTabs);
    setActiveTabId(newTab.id);
    setAddressBarValue("");
    setShowSearch(false);
    saveTabs(newTabs);
  };

  const closeTab = (tabId: string) => {
    const newTabs = tabs.filter(t => t.id !== tabId);
    if (newTabs.length === 0) {
      createNewTab();
      return;
    }
    
    setTabs(newTabs);
    if (activeTabId === tabId) {
      const newActiveTab = newTabs[0];
      setActiveTabId(newActiveTab.id);
      setAddressBarValue(newActiveTab.url);
    }
    saveTabs(newTabs);
  };

  const selectTab = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setActiveTabId(tabId);
      setAddressBarValue(tab.url);
      setShowSearch(false);
    }
  };

  const updateActiveTab = (updates: Partial<TabType>) => {
    const newTabs = tabs.map(tab =>
      tab.id === activeTabId ? { ...tab, ...updates } : tab
    );
    setTabs(newTabs);
    saveTabs(newTabs);
  };

  const handleAddressBarSubmit = async (input: string) => {
    if (!input.trim()) return;

    if (isUrl(input)) {
      // Navigate to URL in native browser
      const url = normalizeUrl(input);
      
      try {
        await CapacitorBrowser.open({ 
          url,
          presentationStyle: 'popover'
        });
        
        updateActiveTab({ url, title: url });
        setAddressBarValue(url);
        setShowSearch(false);

        await storage.addHistory({
          id: crypto.randomUUID(),
          url,
          title: url,
          visitedAt: Date.now(),
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Could not open URL",
          variant: "destructive",
        });
      }
    } else {
      // Perform search
      const index = await storage.getSearchIndex();
      const results = searchIndex(input, index);
      
      if (results.length === 0) {
        // No local results, search with Google
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(input)}`;
        
        try {
          await CapacitorBrowser.open({ 
            url: searchUrl,
            presentationStyle: 'popover'
          });
          
          toast({
            title: "Searching",
            description: `"${input}"`,
          });

          await storage.addHistory({
            id: crypto.randomUUID(),
            url: searchUrl,
            title: `Search: ${input}`,
            visitedAt: Date.now(),
          });
        } catch (error) {
          toast({
            title: "Error",
            description: "Could not perform search",
            variant: "destructive",
          });
        }
      } else {
        setSearchResults(results);
        setShowSearch(true);
      }
    }
  };

  const handleSelectSearchResult = async (url: string) => {
    try {
      await CapacitorBrowser.open({ 
        url,
        presentationStyle: 'popover'
      });
      
      updateActiveTab({ url, title: url });
      setAddressBarValue(url);
      setShowSearch(false);

      await storage.addHistory({
        id: crypto.randomUUID(),
        url,
        title: url,
        visitedAt: Date.now(),
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not open URL",
        variant: "destructive",
      });
    }
  };

  const handlePageLoad = (title: string) => {
    updateActiveTab({ title });
  };

  const activeTab = tabs.find(t => t.id === activeTabId);

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top Bar */}
      <div className="flex items-center gap-2 px-2 py-2 bg-browser-bar border-b border-border">
        {/* Navigation */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ChevronRight className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <RotateCw className="w-4 h-4" />
          </Button>
        </div>

        {/* Address Bar */}
        <AddressBar
          value={addressBarValue}
          onChange={setAddressBarValue}
          onSubmit={handleAddressBarSubmit}
          isSecure={activeTab?.url.startsWith("https://")}
        />

        {/* Menu */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9 flex-shrink-0">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Browser Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-2">
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Bookmark className="w-4 h-4" />
                Bookmarks
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <History className="w-4 h-4" />
                History
              </Button>
              <Button variant="ghost" className="w-full justify-start gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center bg-browser-bar border-b border-border overflow-x-auto">
        <AnimatePresence mode="popLayout">
          {tabs.map(tab => (
            <BrowserTab
              key={tab.id}
              {...tab}
              isActive={tab.id === activeTabId}
              onSelect={() => selectTab(tab.id)}
              onClose={() => closeTab(tab.id)}
            />
          ))}
        </AnimatePresence>
        <Button
          variant="ghost"
          size="icon"
          onClick={createNewTab}
          className="h-10 w-10 flex-shrink-0 ml-1"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>

      {/* Content Area */}
      {showSearch ? (
        <SearchResults
          query={addressBarValue}
          results={searchResults}
          onSelectResult={handleSelectSearchResult}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center bg-background p-8">
          <div className="text-center space-y-4 max-w-md">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-foreground">Private Browser</h2>
            <p className="text-muted-foreground">
              Enter a URL or search term above. All browsing opens in your device's secure browser.
            </p>
            <div className="pt-4 space-y-2 text-sm text-muted-foreground">
              <p>✓ No tracking</p>
              <p>✓ Encrypted history</p>
              <p>✓ Private search</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
