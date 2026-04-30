# VOD Logos

Brand-asset images for the home-page Streaming showcase section
(`src/pages/index.astro`, vodServices array).

## Current files

| Filename | Format | Style |
|---|---|---|
| `netflix.jpg` | JPEG | Square app-icon (red N on black) |
| `prime-video.png` | PNG | Square app-icon (white wordmark on blue) |
| `u-next.jpg` | JPEG | Square app-icon (white shield + U-NEXT on black) |
| `disney-plus.jpg` | JPEG | Square app-icon (white wordmark on blue gradient) |
| `abema.svg` | SVG | Horizontal wordmark — handled with a per-service CSS override |

## To replace any of these

Drop the new file in this directory with the exact filename. The path is
referenced from `src/pages/index.astro`. If you change extension, update
the path in `vodServices` accordingly.

## Sizing

CSS in `src/pages/index.astro` uses `max-height: 64px` and `object-fit:
contain` so any reasonable raster size renders correctly. App-icon style
logos get a `border-radius: 12px` for soft rounded corners. ABEMA gets a
per-service rule (`data-service="abema"`) since it's a wordmark, not an icon.
