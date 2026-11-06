# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Couples and individuals who make an invitation or greeting card for themselves: a wedding, a birthday, an event. They are not designers. They build the card on a desktop browser (the embedded editor hides its panels below 900 px) and send a link to guests, who open it on a phone.

## Product Purpose

CardMaking is a web app for designing online invitations and greeting cards. The person places text, images, shapes and buttons on a page, block by block, then publishes it as a public web page to share (not a flat image). Cards have owner, editor and viewer roles and invite links. Success is a person with no design background finishing a card that looks right for the occasion and sharing the link.

## Positioning

The card is a live web page that scrolls vertically on a phone, built from blocks by the person themselves rather than by filling a template, and themed by occasion (wedding, birthday, event). A reference of the kind of card meant: an online wedding invitation page such as chungdoi.com's demo cards.

## Operating Context

The editing surface is Miditor, a separate editor library embedded in CardMaking. It has a left tool rail (Blocks, Layers, Images, Themes), a canvas, a properties panel and a header (name slot, save, undo and redo, zoom, desktop and phone toggle). A page is 960 px wide on desktop and 375 px on a phone, with free height. The phone layout flows from the desktop one until the person edits it. The host controls the editor's own look through its `appearance` prop (scheme, colours, radius, font) and its language through `i18n` (Vietnamese is shipped). Cards are saved as one whole document with a revision check.

## Capabilities and Constraints

- Web app: Next.js (App Router), Tailwind v4, shadcn/ui, TypeScript. The CardMaking interface around the editor is not decided yet.
- Vietnamese first.
- The editor's panels and structure come from Miditor and are not redrawn by CardMaking; CardMaking draws the frame around it and chooses its appearance settings.
- Occasion themes (wedding, birthday, event) are presets in code; per-user saved themes are not in the first version.
- Real-time collaboration is not in the first version.
- Undecided: pricing, template library, scroll animations (done by CardMaking on the public page, not by Miditor).

## Brand Commitments

None. CardMaking is a working name. There is no logo, palette or voice to preserve.

## Evidence on Hand

No real invitation content, photos or customer material. Any sample names, dates and venues in mockups are invented and must be shown as sample content.

## Product Principles

- A person with no design skills should reach a finished card without learning an editor first.
- The page the guest opens is the product; the editing chrome serves it and stays out of its way.
- The occasion decides the card's character, so wedding, birthday and event cards should not look alike.
- Do not claim what the product cannot do yet: no collaboration, no animations in the editor, no saved personal themes.
