# 📱 Private Vault Browser - Capacitor Setup Guide

Your private browser is now ready! Follow these steps to run it as a native mobile app.

## 🚀 Quick Start (Test in Web Browser)

The app works right now in your web browser! Just click the preview and start browsing privately.

All features work:
- ✅ Tabs management
- ✅ Address bar (URL + search)
- ✅ E2EE local storage
- ✅ Private search engine
- ✅ Bookmarks & history (coming soon in menu)

---

## 📲 Deploy to Physical Device (iOS/Android)

### Prerequisites

**For iOS:**
- Mac computer with Xcode installed
- Apple Developer account (for device testing)

**For Android:**
- Android Studio installed (Windows/Mac/Linux)
- Android device or emulator

---

### Step-by-Step Setup

#### 1️⃣ Export to GitHub

Click the **"Export to Github"** button in Lovable to transfer your project to your own repository.

#### 2️⃣ Clone and Install

```bash
# Clone your repo
git clone <your-github-repo-url>
cd private-vault-browser

# Install dependencies
npm install
```

#### 3️⃣ Initialize Capacitor

Capacitor is already configured! Just add the platforms:

```bash
# For iOS
npx cap add ios

# For Android (or both!)
npx cap add android

# Update native dependencies
npx cap update ios
npx cap update android
```

#### 4️⃣ Build the Web App

```bash
npm run build
```

#### 5️⃣ Sync to Native

```bash
npx cap sync
```

**Important:** Run `npx cap sync` after every `git pull` to keep native code updated!

#### 6️⃣ Run on Device

**iOS:**
```bash
npx cap run ios
```
This opens Xcode. Click the ▶️ play button to run on simulator or connected device.

**Android:**
```bash
npx cap run android
```
This opens Android Studio. Click ▶️ to run on emulator or connected device.

---

## 🔄 Development Workflow

The Capacitor config is set up for **hot reload** from our sandbox! This means:

1. Make changes in Lovable
2. See them instantly in the web preview
3. For native testing: `npx cap sync` → run app

No need to rebuild constantly!

---

## 🔐 Privacy Features

This browser is built for maximum privacy:

- ✅ **E2EE Storage**: All bookmarks, history, and search index encrypted with AES-GCM
- ✅ **Local-First**: Everything stored on device, nothing sent to servers
- ✅ **No Telemetry**: Zero tracking, zero analytics
- ✅ **Device-Bound Encryption**: Each device has unique encryption key
- ✅ **Sandboxed Rendering**: Web pages can't access your local data

---

## 📚 Features

### Current MVP
- **Multi-tab browsing** with smooth animations
- **Unified address bar** (search or navigate)
- **Local search engine** with TF-IDF ranking
- **Encrypted storage** for all data
- **Dark privacy theme** with cyan accents

### Coming Soon
- Bookmarks manager
- History viewer
- Settings page
- Incognito mode
- Ad/tracker blocking

---

## 🛠️ Troubleshooting

**"Cannot sync Capacitor"**
- Make sure you ran `npm run build` first
- Check that `dist` folder exists

**"Site cannot be displayed in browser"**
- Some sites block iframe embedding (CORS/X-Frame-Options)
- This is a security feature of those sites
- Browser extension version would bypass this

**"Build errors"**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (16+ recommended)

---

## 📖 Learn More

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Lovable Mobile Guide](https://docs.lovable.dev/features/capacitor)

---

## 🎯 Next Steps

1. Test the browser in web preview
2. Try searching and navigating
3. When ready, deploy to your phone using steps above
4. Star this project and share your private browser! 🚀
