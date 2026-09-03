#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Ask for a commit message
echo "✏️  Enter your commit message:"
read commit_message

# Fallback to a default message if none is provided
if [ -z "$commit_message" ]; then
  commit_message="feat: update portfolio status and configuration"
fi

echo "🚀 Staging and committing changes on current branch..."
git add .
git commit -m "$commit_message"

echo "📤 Pushing current branch to remote..."
git push origin vercel-config

echo "🔀 Merging changes into master..."
git checkout master
git pull origin master
git merge vercel-config -m "merge: $commit_message"
git push origin master

echo "📦 Building and deploying to GitHub Pages..."
npm run deploy

echo "🔄 Switching back to vercel-config branch..."
git checkout vercel-config

echo "✨ All steps completed successfully! Vercel is building your master branch."