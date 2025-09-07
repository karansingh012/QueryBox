# 🚀 Deploy QueryBox Backend on Render.com

## Step 1: Go to Render.com
1. Visit: https://render.com
2. Sign up/Sign in with GitHub

## Step 2: Create Web Service
1. Click "New +" → "Web Service"
2. Connect GitHub repository: `karansingh012/QueryBox`

## Step 3: Configure Service
**Settings:**
- **Name**: querybox-backend
- **Runtime**: Docker
- **Region**: Choose closest to you
- **Branch**: main
- **Root Directory**: (leave empty)
- **Build Command**: (leave empty - uses Dockerfile)
- **Start Command**: (leave empty - uses Dockerfile)

## Step 4: Environment Variables
Add these in the "Environment" section:
```
GOOGLE_API_KEY=AIzaSyBPR8fn46sZpHIWtfuqJ5jLiJUyYGmDfsg
FLASK_ENV=production
PORT=5000
```

## Step 5: Deploy
1. Click "Create Web Service"
2. Wait for build to complete
3. Get your backend URL: `https://querybox-backend.onrender.com`

## Step 6: Test Backend
Visit: `https://your-render-url.onrender.com/health`

✅ Your backend will be LIVE and working!
