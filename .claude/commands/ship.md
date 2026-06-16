---
description: Commit, push, and open a Pull Request into main (deploy follows on merge)
argument-hint: <message describing the change>
allowed-tools: Bash(git:*), Bash(gh:*)
---
Ship my current branch as a Pull Request to `main`.

1. Safety check: never do this from `main`.
2. Stage, commit with "$ARGUMENTS" (or a concise message from the diff if empty), and push the branch.
3. Open the PR:
   - If the `gh` CLI is available: `gh pr create --fill --base main` (or, if a PR already exists for this branch, just print its URL with `gh pr view --web`).
   - If `gh` is NOT installed: print this clickable link so I can open the PR and click **Merge** on GitHub:
     `https://github.com/filip-dept/eon-site/compare/main...<my-current-branch>?expand=1`
4. Remind me: once the PR is merged into `main`, Vercel automatically deploys to production — no deploy command needed.

Never merge the PR automatically — leave the merge to a human review.
