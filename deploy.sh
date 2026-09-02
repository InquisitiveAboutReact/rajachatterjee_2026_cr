#!/bin/bash

# Exit immediately if any command fails
set -e

# Get the commit message passed as an argument (default to a generic message if empty)
COMMIT_MSG="${1:-"updates: automatic feature deployment"}"

echo "🚀 Step 1: Staging and committing changes on 'dev'..."
git checkout dev
git add .
git commit -m "$COMMIT_MSG" || echo "No changes to commit on dev."

echo "📤 Step 2: Pushing 'dev' to remote (Vercel Preview)..."
git push origin dev

echo "🔀 Step 3: Switching to 'master' and merging 'dev'..."
git checkout master
git merge dev --no-edit

echo "🚀 Step 4: Pushing 'master' to remote (Vercel Production)..."
git push origin master

echo "🔄 Step 5: Switching back to 'dev' for active development..."
git checkout dev

echo "✅ Deployment complete! Both dev and master are updated."