---
description: Commit all my changes and push the current branch to GitHub
argument-hint: <short message of what changed>
allowed-tools: Bash(git:*)
---
Save and upload my current work.

1. Safety check: if I'm on `main`, STOP and warn me — I should be on my own branch. Offer to move my changes onto a new branch.
2. Stage everything: `git add -A`.
3. Commit. Use my message "$ARGUMENTS"; if it's empty, write a concise one-line message from the diff.
4. Push the current branch. If it has no upstream yet, use `git push -u origin <branch>`.
5. Tell me it's pushed and on which branch.

Do not switch branches. Do not merge.
