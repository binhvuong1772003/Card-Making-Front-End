# Neutral editor redesign — verification

## Result

CardMaking uses the existing `config.components` / `customFields` extension to edit a private `cmNavigation` property in ordinary native history snapshots. The app encodes its persisted interaction map at editor entry and strips the temporary property from node props and phone props on save. `CardDocument` v1, the backend registry, public render data and published links retain their existing format.

Miditor removes `checkpoint()` from its public API, controller and document commands, and removes the checkpoint-only notifier `remember()`. It gains no replacement API or external history machinery. Generic `flush()`, save and renderer callbacks remain unchanged. CardMaking no longer keeps a separate interaction-binding history map or calls a library checkpoint.

## Checks

- Editor-only registry validates with existing built-in/custom component definitions and does not mutate those definitions.
- Codec/session tests cover explicit initial nulls, first-link Undo/Redo, clearing links, deleted targets, nested nodes, phone properties, form IDs, page duplication/self-links, restored history, reused IDs and page-deletion Undo.
- Focused codec/session suite: 17 tests passed.
- Full FE suite: 36 files / 291 tests passed. Typecheck passed; lint has zero errors and one pre-existing unused-variable warning in `lib/cards/forms/fields.ts`.
- Miditor focused controller/API/document/notifier suite: 4 files / 54 tests passed; typecheck and editor build passed. Worker also ran the full library suite: 152 files / 1,911 tests passed.
- `miditor-editor-0.0.0-neutral-20261109.tgz` installed; installed dist checksum matches the archive. Source and installed API no longer expose checkpoint. The superseded editor archive was removed from the working tree.
- Final FE production build passed after the application-only field layout adjustment.

## Native browser proof

Public local demo `http://localhost:3001/demo/hoa-moc-xanh`, in-memory editing only:

1. Created a second page and a Button. The existing custom field appeared in the ordinary properties panel.
2. Added a page-1 link. One toolbar Undo removed the link while retaining the Button; Redo restored it.
3. Changed fade to zoom. Toolbar and keyboard Undo restored fade while retaining the target; Redo restored zoom.
4. Deleted the Button and used native Undo; selecting the restored layer showed the same link and zoom effect.
5. Switched to page 1 and back to page 2, selected the layer, and exercised history again; the link and effect remained available.
6. Opened the interaction preview and activated the Button; the player changed to page 1 while keeping the same route.
7. Applied a CardMaking-only CSS rule to give its custom field the full properties row (248 px instead of 108 px); no Miditor layout API or style change was added.

Early browser attempts during source edits were invalidated by development hot reload. Acceptance was repeated on stable source. Native Undo restores data without necessarily restoring selection, so restored nodes were selected from Layers before checking their controls. Offscreen preview controls were activated after exposing them/through their DOM handler; runtime target activation itself was tested with a real browser click.

## Boundaries

No backend code, database record, published card, dependency library or new persisted schema was added. No real save/publish was triggered in the demo. No commits or history rewriting were performed for this redesign; prior project-boundary AGENTS changes were preserved.

The execution reports and independent source review remain in `.superpowers/sdd/2026-11-09-neutral-editor/`.
