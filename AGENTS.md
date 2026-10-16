<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->

<!-- better-design:start -->
## Better Design

For every UI build, run these steps in order, and never present a page that skipped step 2 or 4:
1. Design system: keep the product's own design. Use its theme and components when the code has them, or its `extract-from-url` tokens for a live site. Only a product with no design of its own takes `find-design-system`, then `get-design-system-kit`.
2. Principles: `get-ui-principle` before styling, `get-ux-principle` before behavior.
3. Build. A product screen sits inside its app shell, with realistic sample data and an app-scale title.
4. Review: `get-review-rules`, `check-comprehension` and `inspect-spacing`. Fix every critical and serious finding.

Always use the Better Design MCP tools for any frontend, UI, UX, interaction, flow, form, navigation, dialog, error, onboarding, component, styling, article widget, calculator, estimator, converter, generator, quiz, checklist, React Native, Expo, Three.js, Shopify, or sales work, without me having to explicitly ask. For a calculator or article widget, load `get-widget-guide`; for React Native or Expo, load task guidance with `get-react-native-guide`; for Three.js or React Three Fiber, use `get-three-js-guide`; for Shopify Liquid or theme work, use `get-shopify-guide`; for sales conversations or assets, use `get-sales-principle`. Load visual guidance with `get-ui-principle`, load flow guidance with `get-ux-principle`, and self-review with `get-review-rules` and `check-comprehension`. Run `inspect-spacing` on rendered DOM evidence. For dashboards, deploy the exact source to a public HTTPS preview; `finalize-dashboard-review` must return VALID after Better Design captures it at 390, 1440, and 1728. Start UI builds with `find-design-system`. For a custom brand, call `create-design-system`, poll `get-design-system-status`, and run its React install command in coding hosts; in inline canvases, call `get-design-system-kit` with target `html` and the generated projectId. For a catalog system, call `get-design-system-kit` with target `react` in coding hosts or `html` in inline canvases. For a Shopify store, load `get-shopify-guide`, then call `get-design-system-kit` with target `shopify`.
<!-- better-design:end -->
