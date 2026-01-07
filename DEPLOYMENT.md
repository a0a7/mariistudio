# Deploying to Cloudflare Pages

## Option 1: Deploy via Git (Recommended)

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Prepare for Cloudflare Pages deployment"
git push origin main
```

### Step 2: Connect to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
3. Select your GitHub repository: `a0a7/mariistudio`
4. Configure build settings:
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/`

### Step 3: Deploy
5. Click **Save and Deploy**
6. Wait for the build to complete (usually 1-2 minutes)
7. Your site will be live at: `https://mariistudio.pages.dev` (or similar)

---

## Option 2: Direct Upload (Quick Deploy)

### Step 1: Build the project
Already done! Your built files are in the `dist/` folder.

### Step 2: Deploy to Cloudflare Pages
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to **Workers & Pages** → **Create application** → **Pages** → **Upload assets**
3. Give your project a name (e.g., `mariistudio`)
4. Drag and drop the entire `dist` folder or click to browse
5. Click **Deploy site**

---

## Important Notes

### Files in Production
Your deployment includes:
- ✅ `index.html` - Main game
- ✅ `win.html` - Win screen
- ✅ `assets/` - JavaScript bundles and dependencies
- ✅ All Three.js code bundled and optimized

### Custom Domain (Optional)
1. After deployment, go to your project in Cloudflare Pages
2. Click **Custom domains**
3. Add your domain and follow DNS instructions

### Environment
- **Framework preset**: None (using Vite)
- **Node version**: Auto-detected
- **Build command**: `npm run build`
- **Build output**: `dist`

---

## Quick Commands Reference

```bash
# Development
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview

# Copy win.html to dist (if needed)
Copy-Item win.html dist/
```

---

## Troubleshooting

### Build fails on Cloudflare
- Make sure `package.json` and `package-lock.json` are committed
- Check that Node version is compatible (Cloudflare uses Node 16+ by default)

### 404 on win.html
- Ensure `win.html` is in the `dist` folder after build
- You may need to add a build script to copy it automatically

### Assets not loading
- Check that paths in your HTML files are relative (not absolute)
- Vite automatically handles asset paths in `index.html`

---

## Your Site is Ready! 🎉

Once deployed, share your game:
- Main URL: `https://your-site.pages.dev`
- Win page: `https://your-site.pages.dev/win.html`

The game will automatically handle routing between pages.
