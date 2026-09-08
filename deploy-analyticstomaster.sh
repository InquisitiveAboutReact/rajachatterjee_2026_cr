#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ask for a commit message
echo "✏️  Enter your commit message:"
read commit_message

# Fallback to a default message if none is provided
if [ -z "$commit_message" ]; then
  commit_message="feat: integrate live Upstash Redis analytics and tracking"
fi

echo "🚀 Staging and committing changes on feature-analytics branch..."
git add .
git commit -m "$commit_message"

echo "📤 Pushing feature-analytics branch to remote..."
git push origin feature-analytics

echo "🔀 Merging changes into master..."
git checkout master
git pull origin master
git merge feature-analytics -m "merge: $commit_message"
git push origin master

echo "📦 Building project for production..."
npm run build

# --- NEW: Deploy directly to GitHub Pages ---
echo "🌐 Deploying built assets to GitHub Pages (gh-pages branch)..."
# If you use the 'gh-pages' npm package, this command handles it automatically:
npx gh-pages -d build
# Note: If your build output folder is 'dist' instead of 'build', change it to: npx gh-pages -d dist
# ---------------------------------------------

echo "🔄 Switching back to feature-analytics branch..."
git checkout feature-analytics

echo "✨ All steps completed successfully! Vercel is building master, and GitHub Pages has been updated."