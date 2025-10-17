// Encrypted local storage for browser data
import { encryptData, decryptData, getDeviceKey } from "./encryption";

export interface BrowserTab {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  timestamp: number;
}

export interface Bookmark {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  createdAt: number;
}

export interface HistoryEntry {
  id: string;
  url: string;
  title: string;
  favicon?: string;
  visitedAt: number;
}

export interface SearchIndex {
  url: string;
  title: string;
  content: string;
  keywords: string[];
  timestamp: number;
}

// Encrypted storage wrapper
class EncryptedStorage {
  private async encryptAndStore(key: string, data: any): Promise<void> {
    const deviceKey = await getDeviceKey();
    const jsonString = JSON.stringify(data);
    const encrypted = await encryptData(jsonString, deviceKey);
    localStorage.setItem(key, encrypted);
  }

  private async retrieveAndDecrypt<T>(key: string, defaultValue: T): Promise<T> {
    try {
      const encrypted = localStorage.getItem(key);
      if (!encrypted) return defaultValue;

      const deviceKey = await getDeviceKey();
      const decrypted = await decryptData(encrypted, deviceKey);
      return JSON.parse(decrypted);
    } catch (error) {
      console.error(`Error decrypting ${key}:`, error);
      return defaultValue;
    }
  }

  // Tabs
  async getTabs(): Promise<BrowserTab[]> {
    return this.retrieveAndDecrypt<BrowserTab[]>("encrypted_tabs", []);
  }

  async saveTabs(tabs: BrowserTab[]): Promise<void> {
    await this.encryptAndStore("encrypted_tabs", tabs);
  }

  // Bookmarks
  async getBookmarks(): Promise<Bookmark[]> {
    return this.retrieveAndDecrypt<Bookmark[]>("encrypted_bookmarks", []);
  }

  async saveBookmarks(bookmarks: Bookmark[]): Promise<void> {
    await this.encryptAndStore("encrypted_bookmarks", bookmarks);
  }

  async addBookmark(bookmark: Bookmark): Promise<void> {
    const bookmarks = await this.getBookmarks();
    bookmarks.unshift(bookmark);
    await this.saveBookmarks(bookmarks);
  }

  async removeBookmark(id: string): Promise<void> {
    const bookmarks = await this.getBookmarks();
    const filtered = bookmarks.filter(b => b.id !== id);
    await this.saveBookmarks(filtered);
  }

  // History
  async getHistory(): Promise<HistoryEntry[]> {
    return this.retrieveAndDecrypt<HistoryEntry[]>("encrypted_history", []);
  }

  async saveHistory(history: HistoryEntry[]): Promise<void> {
    await this.encryptAndStore("encrypted_history", history);
  }

  async addHistory(entry: HistoryEntry): Promise<void> {
    const history = await this.getHistory();
    // Remove duplicates and add new entry
    const filtered = history.filter(h => h.url !== entry.url);
    filtered.unshift(entry);
    // Keep last 1000 entries
    const trimmed = filtered.slice(0, 1000);
    await this.saveHistory(trimmed);
  }

  async clearHistory(): Promise<void> {
    await this.saveHistory([]);
  }

  // Search Index
  async getSearchIndex(): Promise<SearchIndex[]> {
    return this.retrieveAndDecrypt<SearchIndex[]>("encrypted_search_index", []);
  }

  async saveSearchIndex(index: SearchIndex[]): Promise<void> {
    await this.encryptAndStore("encrypted_search_index", index);
  }

  async addToSearchIndex(entry: SearchIndex): Promise<void> {
    const index = await this.getSearchIndex();
    // Remove duplicates by URL
    const filtered = index.filter(i => i.url !== entry.url);
    filtered.unshift(entry);
    // Keep last 500 indexed pages
    const trimmed = filtered.slice(0, 500);
    await this.saveSearchIndex(trimmed);
  }

  async clearSearchIndex(): Promise<void> {
    await this.saveSearchIndex([]);
  }
}

export const storage = new EncryptedStorage();
