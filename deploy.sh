#!/bin/bash

echo "=========================================="
echo "  Bimasakti Fleet - Deployment Script"
echo "=========================================="
echo ""

# Check if git remote is set
if ! git remote get-url origin &>/dev/null; then
    echo "⚠️  No GitHub remote found!"
    echo ""
    echo "Please create a GitHub repository first:"
    echo "1. Go to https://github.com/new"
    echo "2. Create a repository named 'bimasakti-fleet'"
    echo "3. Run these commands:"
    echo ""
    echo "   git remote add origin https://github.com/YOUR_USERNAME/bimasakti-fleet.git"
    echo "   git push -u origin main"
    echo ""
    exit 1
fi

echo "✓ Git repository configured"
echo ""

# Push to GitHub
echo "Pushing to GitHub..."
git push -u origin main

echo ""
echo "=========================================="
echo "  Next Steps - Deploy to Cloud"
echo "=========================================="
echo ""
echo "OPTION 1: Railway (Recommended)"
echo "--------------------------------"
echo "1. Go to https://railway.app"
echo "2. Sign in with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
echo "4. Select 'bimasakti-fleet'"
echo "5. Done! Railway will auto-deploy"
echo ""
echo "OPTION 2: Render"
echo "--------------------------------"
echo "1. Go to https://render.com"
echo "2. New → Web Service → Connect GitHub"
echo "3. Select 'bimasakti-fleet' → Docker"
echo "4. Deploy!"
echo ""
echo "OPTION 3: Vercel"
echo "--------------------------------"
echo "1. Go to https://vercel.com/new"
echo "2. Import 'bimasakti-fleet' from GitHub"
echo "3. Deploy!"
echo ""
