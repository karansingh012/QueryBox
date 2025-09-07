#!/bin/bash
echo "Building QueryBox Frontend for Vercel..."

# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Build the project
npm run build

echo "Build completed! Output in frontend/dist"
