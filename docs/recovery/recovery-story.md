# 🚀 From "Lost" to "Live": A Journey in Git Forensics and AI Recovery

## 📱 LinkedIn Version (Short & Punchy)
**Headline: When "Git Reset --Hard" becomes a nightmare... and how I fought back.**

Ever had that heart-stopping moment when you realize hours of uncommitted work have vanished? 😱

Last week, while refactoring my RAG (Retrieval-Augmented Generation) pipeline, a series of complex branch merges and hard resets did the unthinkable: they wiped my local files. No commits. No backups. Just... gone.

But instead of starting from scratch, I turned it into a forensics project. Leveraging the power of `git reflog` and searching for "dangling blobs" in the Git object database, I was able to hunt down the binary fragments of my code. With the help of Claude, we reconstructed the logic, the data chunks, and the API architecture.

**The Lesson:** Git is more powerful than we think. Even when the branch is gone, the data often lingers in the shadows of the `.git` folder.

Check out my fully restored AI Portfolio here: [Your Link]

#Git #SoftwareEngineering #RAG #GenerativeAI #WebDevelopment #TechRecovery #CloudComputing

---

## ✍️ Medium Version (The Technical Deep Dive)
**Title: Digital Archaeology: Recovering Uncommitted Code using Git Internals**

### The Crisis
In the middle of an ambitious upgrade to my portfolio's RAG (Retrieval-Augmented Generation) engine, I hit a wall. During a series of complex branch switches and merge conflict resolutions, I accidentally performed a hard reset that cleared my working directory. Because I hadn't committed my latest "work-in-progress" scripts and data files, I assumed the work was permanently deleted.

### The Discovery
Most developers think that if it's not committed, it's gone. But Git is actually a content-addressable filesystem. Whenever you `git add` a file, Git creates a "blob" (Binary Large Object) in the `.git/objects` directory, regardless of whether you ever run `git commit`.

### The Recovery Process
I embarked on a "digital archaeology" mission using three primary tools:

1. **The Reflog**: I used `git reflog` to track every movement of the HEAD. This allowed me to find "ghost" commits—snapshots that existed but were no longer attached to any branch.
2. **Dangling Blob Hunting**: For the files that were staged but never committed, I used `git fsck --lost-found`. This surfaced "dangling blobs"—orphaned pieces of data floating in the database.
3. **Content-Based Grepping**: Since these blobs have random hexadecimal names, I used `git cat-file` combined with `grep` to search for unique technical fingerprints (like `UPSTASH_VECTOR_REST_URL`) across the entire object database.

### The Result
By combining these forensic techniques, I was able to:
- Recover the exact logic of my `api/chat.js` handler.
- Reconstruct my chunked knowledge base for certifications and experience.
- Restore the embedding scripts that power the vector search.

### Key Takeaways for Developers
- **Always commit often**, even if it's just a "WIP" commit.
- **The Index is your friend**: `git add` is a safety net you didn't know you had.
- **Don't panic**: Your data is rarely "gone" in Git; it's just "unreachable."

#Engineering #Git #RAG #AI #ProgrammingTips #Recovery