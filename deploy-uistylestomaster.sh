#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Target return branch after deployment
TARGET_RETURN_BRANCH="ui-styles-refactor"

# Automatically capture your current active branch name
CURRENT_BRANCH=$(git branch --show-current)

# Ask for a commit message
echo "✏️️  Enter your commit message:"
read commit_message

# Fallback to a default message if none is provided
if [ -z "$commit_message" ]; then
  commit_message="fix(ui): update mobile styling and CV modal layout"
fi

echo "🚀 Staging and committing changes on $CURRENT_BRANCH branch..."
git add .
git commit -m "$commit_message" || echo "No changes to commit, proceeding..."

echo "📤 Pushing $CURRENT_BRANCH branch to remote..."
git push origin "$CURRENT_BRANCH"

echo "🔀 Merging changes into master..."
git checkout master
git pull origin master
git merge "$CURRENT_BRANCH" --no-ff -m "merge: $commit_message" || true
git push origin master

echo "📦 Building project for production..."
npm run build

# --- Deploy built assets ---
echo "🌐 Deploying built assets (gh-pages branch)..."
npx gh-pages -d build
# ---------------------------------------------

echo "🔄 Switching back to $TARGET_RETURN_BRANCH branch..."
git checkout "$TARGET_RETURN_BRANCH"

echo "✨ All steps completed successfully! Master and gh-pages have been updated, and you are back on $TARGET_RETURN_BRANCH."