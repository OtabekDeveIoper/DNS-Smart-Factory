<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Mentored implementation workflow

- The user writes and fixes application code unless they explicitly ask the agent to implement it. The agent may inspect code, run verification commands, and maintain project documentation or agent instructions when requested.
- Before every implementation step, explain the goal, architectural responsibility, runtime flow, file placement, and important code fields or APIs. Then provide focused code for the user to type and commands for them to verify it.
- Work in small, coherent vertical slices. Do not move to the next slice until the current slice has been reviewed and its relevant build, test, or smoke checks pass.
- After each verified, logically complete slice, explicitly announce a **commit checkpoint**. Inspect `git status` and the relevant diff, identify exactly which files belong to the commit, and provide an appropriate Conventional Commit message.
- Never recommend committing known broken or unverified work. Warn the user before starting the next slice when the current work should be committed first.
