# WJR Taxi Tours & Auto Rentals

Website for WJR Taxi Tours & Auto Rentals, Mardigras, St. George, Grenada. Designed and built by [Savvy Tech](https://ghosten22.github.io/savvy-tech/).

Live at: https://projects473.github.io/wjrdemo2/

## Files

- `index.html`: the page
- `css/styles.css`: all styling. Brand colours are set at the top: Peach `#FFD3AC`, Sky `#97CCF6` and Charcoal `#1E2328`. The hero animation (photo slideshow, rising GRENADA lettering and the Toyota Noah with the WJR logo driving past palm trees by day, and under the moon, stars and street lamps with its headlights on in the charcoal version) is in the Hero section and switches off for visitors who turn on reduced motion. Fonts: Bebas Neue (headings), Kaushan Script (small labels) and Plus Jakarta Sans (text), loaded from Google Fonts.
- `js/fares.js`: WJR's taxi rates (116 destinations from 6 pickup areas), used by the rate shown in the booking panel. Edit prices here.
- `js/rentals.js`: rental rates (daily and weekly) and where the bookings file lives on GitHub
- `admin.html`: Wayne's private bookings page (access key and password, not listed on Google)
- `data/bookings.json`: the rental bookings Wayne manages on `admin.html` (customer details are encrypted)
- `SETUP-BOOKINGS.md`: how to connect the bookings page
- `js/main.js`: booking tabs, taxi price rules, rental totals, the availability calendar, destination cards (their rates are read from `fares.js`), WhatsApp booking messages, the photo strip and mobile menu
- `assets/`: WJR logo, favicon and phone home-screen icon
- `files/WJR-Rental-Agreement.pdf`: the rental agreement linked from the rental terms
- `robots.txt`, `sitemap.xml`: help Google find and index the site
- `.nojekyll`: tells GitHub Pages to serve the files as they are

## White and charcoal versions

The site opens in the white version, where the main brand colour is Peach (Primary Colour 1): the menu bar, buttons and highlights. The round button in the menu bar switches to the charcoal version, where the main colour is Sky (Primary Colour 2). A visitor's choice is remembered on their device. To open the charcoal version directly, add `?theme=dark` to the address. To make charcoal the default, remove `data-theme="light"` from the `<html>` tag in `index.html`. The white version's colours are in the section of `css/styles.css` headed "Light version".

## Publish or update on GitHub Pages

1. Open the `wjrdemo2` repository in the `projects473` account.
2. Upload everything in this folder to the root of the repository, replacing the old files. Include the hidden `.nojekyll` file.
3. If Pages is not on yet: **Settings > Pages**, Source **Deploy from a branch**, `main`, `/ (root)`, Save.
4. Changes go live at https://projects473.github.io/wjrdemo2/ within a few minutes.

## Updating rates

Open `js/fares.js`. Each line is one destination, for example:

    ["Grand Etang","St. George",[[90,36],[100,40],[90,36],[100,40],[110,44],[70,28]]]

The six pairs are `[EC$, US$]` from each pickup area, in this order: Umbrellas / IGA / Wall St. / Coyaba / Siesta, Secret Harbour, Mahogany Run / BBC Beach, Lavo Lanes / Calliste, MBIA airport / Royalton, St. George's. Use `0` when the destination is in that same area and `null` when there is no fare yet.

These are the rates for 1 to 2 passengers. The website adds two charges automatically:

- **Airport pickup:** EC$10 when the trip starts at MBIA airport. Trips to the airport, and pickups at Royalton, use the listed rate.
- **Extra passengers:** EC$10 for each passenger above 2 (3 passengers +EC$10, 4 passengers +EC$20, and so on).

When a charge is added, the US$ price is worked out from the new EC$ price the same way as the list (EC$60 = US$25, otherwise 40% of the EC$ price). The charges are set at the top of the taxi section in `js/main.js` (`AIRPORT_FEE`, `EXTRA_PAX_FEE`, `PAX_INCLUDED`).

## Rental rates and the availability calendar

Open `js/rentals.js`.

- `daily` is the price per day for rentals of less than 7 days; `weekly` is the price per day for 7 days or more. A rental's length is counted from the pick-up date to the return date (same-day returns count as 1 day).
- Booked dates are managed on `admin.html`. Wayne logs in, taps the dates, and the booking is saved to `data/bookings.json` in this repository. The calendar reads that file, so the dates show within about a minute. See `SETUP-BOOKINGS.md` to connect it.
- `data/bookings.json` starts with example bookings for the demo. Delete them on the bookings page before launch.
- Visitors choose dates and send the request on WhatsApp. WJR confirms on WhatsApp, then adds the booking on the bookings page.

## Before launch

- Vehicle photos show the same models and colours as WJR's cars. Swap in photos of WJR's own vehicles when available.
- Connect the bookings page (`SETUP-BOOKINGS.md`) and delete the example bookings.
- Add tour prices when confirmed.
- The map is pinned to WJR's Google Maps listing (12.051823, -61.7259606) and the "Open in Google Maps" button uses https://maps.app.goo.gl/k7Sct81pZx5L4zoy9.
- Add Google Search Console and submit `sitemap.xml`.

## Photo credits

Island photos are loaded from [Unsplash](https://unsplash.com) under the Unsplash License.

Vehicle photos are loaded from Wikimedia Commons. Their licences require credit to the photographer; the credits are kept in each photo's tooltip (title attribute) and listed here:

- Suzuki Ignis: Vauxford, CC BY-SA 4.0
- Toyota Raize Hybrid: Tokumeigakarinoaoshima, CC BY-SA 4.0
- Honda Vezel (HR-V): RL GNZLZ, CC BY-SA 2.0
