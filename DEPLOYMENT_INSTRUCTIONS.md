# 🚀 QueryBox AI - Live Deployment Guide

## Part 1: Deploy Frontend on Vercel

### Step 1: Go to Vercel
1. Visit: https://vercel.com
2. Sign in with GitHub account

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Import Git Repository
3. Search and select: `karansingh012/QueryBox`
4. Click "Import"

### Step 3: Configure Build Settings
**IMPORTANT - Set these exact settings:**
- **Framework Preset**: `Vite`
- **Root Directory**: `frontend` ✅
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Deploy Frontend
1. Click "Deploy"
2. Wait for build to complete
3. You'll get a URL like: `https://query-box-xxxxx.vercel.app`

---

## Part 2: Deploy Backend on Railway

### Step 1: Go to Railway
1. Visit: https://railway.app
2. Sign in with GitHub

### Step 2: Create New Project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose: `karansingh012/QueryBox`
4. Railway will detect Python app in backend folder

### Step 3: Add Environment Variables
In Railway Dashboard → Your Service → Variables tab, add:

```
GOOGLE_API_KEY=AIzaSyBPR8fn46sZpHIWtfuqJ5jLiJUyYGmDfsg
FLASK_ENV=production
PORT=5000
```

### Step 4: Deploy Backend
1. Click "Deploy"
2. Wait for deployment
3. You'll get a URL like: `https://querybox-backend-production.up.railway.app`

---

## Part 3: Connect Frontend to Backend

### Step 1: Update Frontend Environment
1. Go back to **Vercel Dashboard**
2. Select your QueryBox project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   ```
   VITE_API_URL=https://your-backend-railway-url.up.railway.app
   ```
5. Click **Save**

### Step 2: Redeploy Frontend
1. Go to **Deployments** tab
2. Click **"Redeploy"** on the latest deployment
3. This will rebuild frontend with the backend URL

---

## Part 4: Test Your Live App

After both deployments:
1. **Visit your Vercel frontend URL**
2. **Test the AI interview functionality**
3. **Check if frontend can communicate with backend**

---

## 🔧 Troubleshooting

### If frontend can't connect to backend:
1. Check VITE_API_URL is set correctly in Vercel
2. Make sure Railway backend is running (check logs)
3. Verify CORS settings allow your frontend domain

### If AI responses don't work:
1. Verify GOOGLE_API_KEY is set in Railway
2. Check Railway logs for errors
3. Test the /health endpoint: `https://your-backend-url.railway.app/health`

---

## 🎉 You're Live!

Your QueryBox AI will be accessible at:
- **Frontend**: Your Vercel URL
- **Backend API**: Your Railway URL

The app is now live and ready for users worldwide! 🌍
