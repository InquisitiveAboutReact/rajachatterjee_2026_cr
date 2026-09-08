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

echo "📦 Building and deploying..."
npm run build

echo "🔄 Switching back to feature-analytics branch..."
git checkout feature-analytics

echo "✨ All steps completed successfully! Your live analytics backend and frontend changes are now merged into master and deploying to production on Vercel."