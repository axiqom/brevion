# Official logos from brevion_logo_package.zip only: 5.png + 8-26.png. No 6/7. No derivatives.

Site wiring (via BrandLogo / BaseLayout):
- porcelain chrome (header, footer, RFQ, chat) → 18.png (carbon + porcelain fills)
- hero on photo → 15.png on solid `bg-carbon` (#453F3A) plate/chip
- aluminum surfaces only → 17.png (carbon + aluminum) — never on porcelain
- favicon / apple-touch → 9.png

Sizing: pack canvases are 2000² with pad; horizontal contentH≈0.208 of canvas.
`.brand-logo` sets wrapper to visual height and scales img by 1/0.208 (CSS only — no cropped files).
