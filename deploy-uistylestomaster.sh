#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Dynamically capture your starting branch name before switching anywhere
START_BRANCH=$(git branch --show-current)
echo "📍 Starting branch captured: $START_BRANCH"

# Ask for a commit message
echo "✏️  Enter your commit message:"
read commit_message

# Fallback to a default message if none is provided
if [ -z "$commit_message" ]; then
  commit_message="fix: resolve video asset path and deploy production"
fi

echo "🚀 Staging and committing changes on $START_BRANCH branch..."
git add .
git commit -m "$commit_message" || echo "No changes to commit or already committed."

echo "📤 Pushing $START_BRANCH branch to remote..."
git push origin "$START_BRANCH"

echo "🔀 Merging changes into master..."
git checkout master
git pull origin master
git merge "$START_BRANCH" --no-ff -m "merge: $commit_message" || true
git push origin master

echo "📦 Building project for production..."
npm run build

echo "🌐 Deploying built assets to gh-pages branch..."
npx gh-pages -d build --dotfiles --remote origin

echo "🔄 Switching back to $START_BRANCH branch..."
git checkout "$START_BRANCH"

echo "✨ Deployment complete! You are safely back on $START_BRANCH."