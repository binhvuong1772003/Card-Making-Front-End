<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Independent editor dependency

CardMaking and Miditor are separate projects. Miditor must remain a small, host-neutral editor and renderer serving multiple applications.

Keep card documents, page management, page navigation, transitions, persistence and business history in CardMaking. Reuse Miditor's existing extension points before changing its API. Do not add generic-looking machinery to Miditor solely to support CardMaking's external state; a library change needs a general editor/rendering reason. Preserve working behavior when moving responsibilities across this boundary.

## Rebuilding invitation references

Use the shared [`clone-invitation` skill](../.claude/skills/clone-invitation/SKILL.md) for clone plans, implementation and refinement. It includes the measured-DOM workflow and the lessons from Claude's corrections; respect the current scope (including content-only handoffs and skipped templates) before applying its checks.

Start with [`docs/references/invitation-cloning-guide.md`](docs/references/invitation-cloning-guide.md), the shared workflow distilled from Minimalism Đỏ Đậm and Song Hỷ Xanh. It is the common reference for source inspection, asset capture, editor assembly, motion, verification and template synchronization. Keep source-specific XPath, markup and measurements in the linked per-template notes.

Read source elements before making visual changes. Treat screenshots as a cross-check. A clone is complete only when its appearance matches the reference and a user can reproduce it with the available catalog assets and editor controls. Record missing controls explicitly; an SVG, generated JSON or template-specific CSS does not prove editor reproducibility. Keep the demo document and the published MongoDB template snapshot in sync, and verify the actual homepage entry and the card created through “Dùng mẫu này”.
