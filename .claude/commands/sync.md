---
description: Pull the latest main into my current branch (get my teammate's merged work)
allowed-tools: Bash(git:*)
---
Bring my current branch up to date with the latest `main`.

1. Remember the branch I'm currently on.
2. `git checkout main && git pull`.
3. Switch back to my branch and `git merge main`.
4. If there are merge conflicts, STOP, list the conflicted files, and help me resolve them — do not force anything.
5. Otherwise confirm I'm up to date.
