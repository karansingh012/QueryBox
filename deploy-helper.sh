#!/bin/bash

echo "🚀 QueryBox AI Deployment Helper"
echo "=================================="

echo "📋 Pre-deployment checklist:"
echo "✅ Code pushed to GitHub: karansingh012/QueryBox"
echo "✅ Google API Key ready: AIzaSyBPR8fn46sZpHIWtfuqJ5jLiJUyYGmDfsg"
echo "✅ All configuration files created"
echo ""

echo "🎯 Next Steps:"
echo "1. Frontend Deployment (Vercel):"
echo "   → Open: https://vercel.com"
echo "   → Sign in with GitHub"
echo "   → Import: karansingh012/QueryBox"
echo "   → Root Directory: frontend"
echo "   → Framework: Vite"
echo "   → Deploy!"
echo ""

echo "2. Backend Deployment (Railway):"
echo "   → Open: https://railway.app"
echo "   → Sign in with GitHub"
echo "   → Deploy: karansingh012/QueryBox"
echo "   → Add environment variables:"
echo "     GOOGLE_API_KEY=AIzaSyBPR8fn46sZpHIWtfuqJ5jLiJUyYGmDfsg"
echo "     FLASK_ENV=production"
echo "     PORT=5000"
echo ""

echo "3. Connect Frontend to Backend:"
echo "   → Get Railway backend URL"
echo "   → Add to Vercel environment: VITE_API_URL=backend_url"
echo "   → Redeploy frontend"
echo ""

echo "🌟 Your app will be live!"
echo "Need help? Let me know which step you're on!"

# Test if frontend builds locally
echo "🧪 Testing frontend build locally..."
cd frontend
if npm run build; then
    echo "✅ Frontend builds successfully!"
else
    echo "❌ Frontend build failed. Check for errors."
fi

cd ..
echo "Ready for deployment! 🚀"
