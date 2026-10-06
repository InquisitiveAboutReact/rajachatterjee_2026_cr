#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# 1. Capture current active branch
CURRENT_BRANCH=$(git branch --show-current)

# Prevent accidental deployment from master itself
if [ "$CURRENT_BRANCH" == "master" ]; then
  echo "❌ Error: You cannot run this script while on the 'master' branch."
  echo "Please switch to your feature branch first (e.g., git checkout recovery/rag-mcp-restore)."
  exit 1
fi

echo "🚀 Starting Deployment Process from branch: $CURRENT_BRANCH"

# 2. Handle Commit Message
echo "✏️  Enter your commit message (press Enter for default):"
read commit_message

if [ -z "$commit_message" ]; then
  commit_message="feat: update RAG/MCP implementation and grounded knowledge base"
fi

# 3. Stage and Commit local changes
echo "📦 Staging and committing changes on $CURRENT_BRANCH..."
git add .
git commit -m "$commit_message" || echo "No changes to commit, proceeding anyway..."

# 4. Push current branch to remote (GitHub)
echo "📤 Pushing $CURRENT_BRANCH to remote..."
git push origin "$CURRENT_BRANCH"

# 5. Merge into Master
echo "🔀 Merging into master branch..."
git checkout master
git pull origin master

# Use --no-ff to keep a clean merge commit history
if git merge "$CURRENT_BRANCH" --no-ff -m "merge: $commit_message"; then
  echo "✅ Merge successful."
else
  echo "❌ Merge conflict detected! Please resolve conflicts manually before deploying."
  git checkout "$CURRENT_BRANCH"
  exit 1
fi

# 6. Push Master to GitHub & Vercel
echo "📤 Pushing master to remote (Triggering Vercel Deployment)..."
git push origin master

# 7. Build and Deploy to GitHub Pages (Static Assets)
echo "🏗️  Building project for production..."
npm run build

echo "🌐 Deploying built assets to gh-pages..."
npx gh-pages -d build

# 8. Return to original branch
echo "🔄 Returning to $CURRENT_BRANCH..."
git checkout "$CURRENT_BRANCH"

echo "✨ SUCCESS! Everything is deployed."
echo "1. Master branch updated on GitHub."
echo "2. Vercel build triggered."
echo "3. GitHub Pages updated."
echo "4. You are back on your working branch: $CURRENT_BRANCH"
