# Minimalism Nâu Content Page Design

**Goal:** Recreate the opened invitation content page from Minimalism Nâu in CardMaking, with the source artwork saved as reusable assets and each visible component editable without writing code.

**In scope:** Acquire the decorative artwork and source photos; create the invitation content page and its sections using CardMaking blocks; add decorative assets to Cloudinary and MongoDB catalog.

**Out of scope:** The opening cover card, the cover-to-invitation transition, Miditor-specific behavior, autoplay music, copied payment details, source tracking/chat widgets and the source brand footer link.

## Source facts

Use `docs/references/minimalism-nau-elements.md` as the asset and DOM manifest. The source content root is `[data-testid="minimalism-brown-template"]`, a centered 480px mobile / 900px desktop column with background `#fff7f3` and text `#7c6a60`. The section list, source asset URLs, colors, fonts and `mbFloat` motion are recorded in that file. Read live bounding rectangles at the chosen viewport sizes before placing the local sections; the attached HTML has responsive classes but not all resolved geometry.

## User-facing behavior

- The template contains one CardMaking page with ID `invitation`, selected as the starting page. No cover page or open button is included.
- The page preserves the source section order: hero photo, wedding/family details, album, reception/calendar/RSVP, venue/map, dress code, schedule, guestbook, gift section and thank-you text.
- Decorations are separate replaceable assets. The lead photo is a user-replaceable Image with a separate frame Decoration. Album images remain editable through the existing Album control. Schedule icons and seven gift minis remain independent Decorations.
- Existing Calendar, Map, Form, Album and popup interactions are used where they match the source. Payment content is a nonfunctional local placeholder; no source QR account payload is copied.
- Floral motion uses the existing generic Decoration motion control; users can turn it off. Do not add CSS keyed to the `minimalism-nau` slug or modify Miditor for this template.

## Asset persistence

- Cloudinary stores the image files.
- MongoDB stores catalog metadata, category, tags, dimensions, public ID and published state.
- Decorative artwork is categorized for the Trang trí catalog. Album/lead photos use the existing photo/image asset path.
- Preserve original WebP/alpha and create no synthetic replacement assets. Use the browser to retrieve source files if direct download returns 403.

## Acceptance criteria

1. `/demo/minimalism-nau` and the gallery template show the invitation content directly, with no opening cover.
2. The whole source decorative asset set is available through Cloudinary and the relevant MongoDB asset catalog; the seven gift minis are separate entries.
3. The editor contains separate editable blocks for the decorative pieces. A user can replace the lead photo and album images and can reposition, resize, rotate or hide individual Decorations using the existing editor controls.
4. The source section order, palette, typography, paper/background treatment and responsive column widths are represented from DOM evidence. Unmeasured values are not described as exact.
5. Album, calendar, map, RSVP, guestbook and gift dialog work through the existing CardMaking components. No source payment QR or music auto-play is carried into the demo.
6. The template is saved under the existing `minimalism-nau` gallery slug without overwriting user-owned cards.
