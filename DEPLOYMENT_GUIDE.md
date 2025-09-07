# QueryBox AI - Railway Deployment Guide

## Environment Variables for Backend Service

Add these in Railway Dashboard → Backend Service → Variables:

```
GOOGLE_API_KEY=your_gemini_api_key_here
FLASK_ENV=production
PORT=5000
ALLOWED_ORIGINS=https://your-frontend-url.railway.app
```

## Environment Variables for Frontend Service

Add these in Railway Dashboard → Frontend Service → Variables:

```
NODE_ENV=production
VITE_API_URL=https://your-backend-url.railway.app
```

## Deployment Steps:

1. Go to railway.app
2. Sign in with GitHub
3. New Project → Deploy from GitHub repo
4. Select karansingh012/QueryBox
5. Wait for automatic detection
6. Add environment variables above
7. Deploy!

## URLs After Deployment:

Railway will provide URLs like:
- Frontend: https://querybox-frontend-production-xxxx.up.railway.app
- Backend: https://querybox-backend-production-xxxx.up.railway.app

## Getting Your Gemini API Key:

1. Go to: https://aistudio.google.com/app/apikey
2. Create new API key
3. Copy and use in GOOGLE_API_KEY

## After Deployment:

1. Update ALLOWED_ORIGINS with your frontend URL
2. Update VITE_API_URL with your backend URL
3. Test the live application!
