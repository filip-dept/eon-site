---
description: Start fresh work — pull latest main, then create/switch to a branch
argument-hint: <branch-name, e.g. hero-page>
allowed-tools: Bash(git:*)
---
Start work on branch `$ARGUMENTS`.

1. `git checkout main && git pull` so I build on the newest code.
2. If a branch named `$ARGUMENTS` already exists, just switch to it (`git checkout $ARGUMENTS`) and merge main into it.
   Otherwise create it: `git checkout -b $ARGUMENTS`.
3. Confirm which branch I'm now on.

If `$ARGUMENTS` is empty, ask me for a branch name first.
