# VOD Logos

Drop the official brand-asset SVGs (or PNGs) here, named exactly as below.
The home-page Streaming showcase section reads from this directory.

| Service | Filename | Official source |
|---|---|---|
| Netflix | `netflix.svg` | https://brand.netflix.com/en/assets/brand-symbol/ |
| Amazon Prime Video | `prime-video.svg` | https://advertising.amazon.com/library/guides/prime-video-brand-assets |
| U-NEXT | `u-next.svg` | U-NEXT 公式の媒体資料／プレスキット |
| Disney+ | `disney-plus.svg` | https://thewaltdisneycompany.com/lp/disney-plus-press-kit/ |
| ABEMA | `abema.svg` | ABEMA 公式の媒体資料 |

If the official site doesn't expose a public brand kit download, Wikipedia
typically hosts the logo as SVG (Public Domain or fair-use for trademarks).
Right-click → save the image, rename, and drop in here.

Recommended height: ~40–60px. The CSS in `src/pages/index.astro` will
constrain max-height to 40px and apply `filter: brightness(...)` on hover,
so any reasonable size works.
