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

echo "🚀 Staging and committing changes on analytics branch..."
git add .
git commit -m "$commit_message"

echo "📤 Pushing analytics branch to remote..."
git push origin analytics

echo "🔀 Merging changes into master..."
git checkout master
git pull origin master
git merge analytics -m "merge: $commit_message"
git push origin master

echo "📦 Building and deploying to GitHub Pages..."
npm run deploy

echo "🔄 Switching back to analytics branch..."
git checkout analytics

echo "✨ All steps completed successfully! Your changes are pushed from analytics -> master."