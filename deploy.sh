# #!/bin/bash

# # Exit immediately if any command fails
# set -e

# # Get the commit message passed as an argument
# COMMIT_MSG="${1:-"updates: automatic feature deployment"}"

# echo "🚀 Step 1: Staging and committing changes on 'dev'..."
# git checkout dev
# git add .
# git commit -m "$COMMIT_MSG" || echo "No changes to commit on dev."

# echo "📤 Step 2: Pushing 'dev' to remote (Vercel Preview)..."
# git push origin dev

# echo "🔀 Step 3: Switching to 'master' and merging 'dev'..."
# git checkout master
# git merge dev --no-edit

# echo "🚀 Step 4: Pushing 'master' to remote (Vercel Production)..."
# git push origin master

# echo "📦 Step 5: Building and deploying to GitHub Pages..."
# npm run deploy  # Or 'npm run build' depending on your package.json script

# echo "🔄 Step 6: Switching back to 'dev' for active development..."
# git checkout dev

# echo "✅ Dual Deployment Complete! Live on both Vercel & GitHub Pages."



#!/bin/bash
set -e

CURRENT_BRANCH=$(git branch --show-current)

echo "🚀 Starting deployment from $CURRENT_BRANCH..."

# 1. Stage and commit pending changes
git add .
read -p "Enter commit message: " msg
git commit -m "$msg" || echo "No changes to commit."

# 2. Push active feature branch
git push origin $CURRENT_BRANCH

# 3. Merge active branch into master
echo "🔄 Merging $CURRENT_BRANCH into master..."
git checkout master
git pull origin master
git merge $CURRENT_BRANCH --no-edit
git push origin master

# 4. Keep dev branch synced with master
echo "🔄 Syncing master back to dev..."
git checkout dev
git merge master --no-edit
git push origin dev

# 5. Return to active working branch
git checkout $CURRENT_BRANCH

echo "✅ Deployment complete! Returned to branch: $CURRENT_BRANCH"