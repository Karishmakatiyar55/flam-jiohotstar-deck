# Flam × JioHotstar · Flicks

The Flam × JioHotstar pitch deck as one self-contained static page (`index.html`), in the style of the Flam × Meta decks.

## Slides (7)
1. Hook, with a live Flick in a pre-roll mock
2. Four gaps: commerce, ad slots, video insights, SMB advertisers
3. Same episode, more to sell (formats on top of what is sold today)
4. Video insights, made interactive
5. Commerce and new advertisers
6. Live demo (the JioHotstar demo in a phone frame, with a run sheet)
7. Revenue math (an editable example)

## Present
- Arrow keys or the on-screen buttons move between slides; **F** toggles full screen; `#4` in the address opens slide 4.
- The live Flicks and the demo load from the web, so present online.
- A Flick's frame exists only while its slide is on screen, so nothing keeps playing after you move on.

## Edit
Edit the files in `src/`, then run `python3 build.py`. It writes `index.html` with the styles, script, logos and background inlined.

Settings are at the top of `src/deck.js`: `DEMO` (demo link), `DEMO_SLOTS`, `FLOWS` (run sheet on the demo slide), `FLICKS`, `CATS` (advertiser categories) and `MATH` (calculator defaults).

## Numbers
The revenue slide uses example numbers, not JioHotstar's rate card. They are shown gross, before Flam's fee.

## Deploy on Vercel
Framework preset: **Other**. No build command, output directory = root.

Concept deck by Flam. Not affiliated with or endorsed by JioHotstar or the brands shown.
