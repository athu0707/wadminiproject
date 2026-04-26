# ⚗️ PracticalVault v2.0 — Practical Exam Paper Manager

A clean, dark-themed web app to store, download, print and share all your practical exam papers.

## 🚀 How to Run
Just open **`index.html`** in Chrome, Firefox or Edge. No server needed!

## ✨ New Features in v2.0

### 📥 Instant Code Download
- Click **⬇ Code** on any card to download the code file instantly
- Auto-saves with correct extension (.py, .c, .cpp, .java, .js, .html, .sql)

### 📄 Export as PDF
- Click **📄 PDF** on any card to generate a beautiful A4 PDF of that practical
- Includes: Aim, Output Links, Download Link, Full Code — all formatted
- Uses jsPDF (loaded from CDN)

### 📊 Index Page PDF
- Go to **Index Page** in sidebar
- Click **Export PDF** → downloads a landscape table of ALL practicals
- Or click **Print** → opens browser print dialog

### 🖨️ Print All
- Click **Print All** button in top bar to instantly print the index

### 📤 Share
- Click **Share** on any card
- On mobile: uses native Share Sheet (WhatsApp, Gmail, etc.)
- On desktop: copies full details to clipboard

### 📋 Index Page View
- New sidebar section showing ALL practicals in a table
- Serial No., Title, Subject, Language, Output Links, Code status, Download
- Per-row actions: View, Download Code, Export PDF

## 📂 Files
```
PracticalVault/
├── index.html   ← Structure
├── style.css    ← Dark theme
├── app.js       ← All logic
└── README.md    ← This file
```

## 🌐 Host on GitHub Pages (Free)
1. Create repo on github.com → upload these 4 files
2. Settings → Pages → Deploy from `main`
3. Share: `https://yourusername.github.io/PracticalVault`
