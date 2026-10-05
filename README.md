# WJR Taxi Tours & Auto Rentals

Website for WJR Taxi Tours & Auto Rentals, Mardigras, St. George, Grenada. Designed and built by [Savvy Tech](https://ghosten22.github.io/savvy-tech/).

Live at: https://projects473.github.io/wjr/

## Files

- `index.html`: the page
- `css/styles.css`: all styling. Brand colours are set at the top: Peach `#FFD3AC`, Sky `#97CCF6` (also the menu bar) and Charcoal `#1E2328` (the page background). The hero animation (photo slideshow, rising GRENADA lettering and the Toyota Noah driving across) is in the Hero section and switches off for visitors who turn on reduced motion. Fonts: Bebas Neue (headings), Kaushan Script (small labels) and Plus Jakarta Sans (text), loaded from Google Fonts.
- `js/fares.js`: WJR's taxi rates (116 destinations from 6 pickup areas), used by the rate shown in the booking panel. Edit prices here.
- `js/main.js`: booking tabs, the rate shown in the booking bar, destination cards (their rates are read from `fares.js`), WhatsApp booking messages, the photo strip and mobile menu
- `assets/`: WJR logo, favicon and phone home-screen icon
- `files/WJR-Rental-Agreement.pdf`: the rental agreement linked from the rental terms
- `robots.txt`, `sitemap.xml`: help Google find and index the site
- `.nojekyll`: tells GitHub Pages to serve the files as they are

## Publish or update on GitHub Pages

1. Open the `wjr` repository in the `projects473` account.
2. Upload everything in this folder to the root of the repository, replacing the old files. Include the hidden `.nojekyll` file.
3. If Pages is not on yet: **Settings > Pages**, Source **Deploy from a branch**, `main`, `/ (root)`, Save.
4. Changes go live at https://projects473.github.io/wjr/ within a few minutes.

## Updating rates

Open `js/fares.js`. Each line is one destination, for example:

    ["Grand Etang","St. George",[[90,36],[100,40],[90,36],[100,40],[110,44],[70,28]]]

The six pairs are `[EC$, US$]` from each pickup area, in this order: Umbrellas / IGA / Wall St. / Coyaba / Siesta, Secret Harbour, Mahogany Run / BBC Beach, Lavo Lanes / Calliste, MBIA airport / Royalton, St. George's. Use `0` when the destination is in that same area and `null` when there is no fare yet.

## Before launch

- Vehicle photos show the same models and colours as WJR's cars. Swap in photos of WJR's own vehicles when available.
- Add daily rental rates and tour prices when confirmed.
- The map is pinned to WJR's Google Maps listing (12.051823, -61.7259606) and the "Open in Google Maps" button uses https://maps.app.goo.gl/k7Sct81pZx5L4zoy9.
- Add Google Search Console and submit `sitemap.xml`.

## Photo credits

Island photos are loaded from [Unsplash](https://unsplash.com) under the Unsplash License.

Vehicle photos are loaded from Wikimedia Commons. Their licences require credit to the photographer; the credits are kept in each photo's tooltip (title attribute) and listed here:

- Suzuki Ignis: Vauxford, CC BY-SA 4.0
- Toyota Raize Hybrid: Tokumeigakarinoaoshima, CC BY-SA 4.0
- Honda Vezel (HR-V): RL GNZLZ, CC BY-SA 2.0
