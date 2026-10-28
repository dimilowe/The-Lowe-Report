# VCM AdCore publisher integration

The homepage renders one `tlr_home_banner` slot after the lead stories, accepting display and native inventory when enabled in AdCore.
`components/ads/AdSlot.tsx` loads AdCore's `/adcore.js` after hydration. The SDK
owns selection, rendering, the Advertisement disclosure, and impression tracking.
Newsletter, article, account, admin, and checkout routes do not include this slot.

## Configuration

Local `.env.local` settings:

```dotenv
NEXT_PUBLIC_ADCORE_URL=https://vcmadcore.com
NEXT_PUBLIC_ADCORE_APP_NAME=The Lowe Report
```

Restart the site's development server after changing these values. Configure the
same values in the production hosting environment and rebuild before deployment.
For a local AdCore server, use `http://localhost:5001` during development only. Missing/invalid origins and production localhost origins disable ads.
Set AdCore's server-side `APP_URL` to its own public origin for tracking URLs.
These settings are public; never add management credentials or secrets here.

## AdCore setup

Register the app as **The Lowe Report**, then create an active Display placement
with key `tlr_home_banner` and floor CPM `0` for testing. Prepare an approved,
active image creative with reachable media and landing-page URLs. Its campaign
needs funded credit, a positive CPC/CPM bid, remaining budget, matching app and
placement targeting, and a current schedule. Leave country/interest targeting
empty because the site sends neither attribute.

## Verify delivery

1. Use AdCore's Integration → Test ad selection for the app and placement.
2. Open the homepage; confirm `/adcore.js` and `POST /api/ads/get` load from
   AdCore, with app `The Lowe Report` and placement `tlr_home_banner`.
3. Confirm `fill: true`, the disclosure, and usable mobile/desktop rendering.
4. After media loads and at least half the ad is visible, verify one impression
   request. A test click follows the returned tracking URL and can consume credit.
5. Check AdCore Events and performance by app; navigate away and back to verify
   cleanup and a fresh delivery. Pause inventory to verify the slot collapses.

The component aborts pending requests on unmount and gives selection eight seconds
after SDK readiness. No fill, request failures, and script errors hide the slot.
The script download itself has no timeout. The `enabled` prop can accept a site's
advertising preference decision; no consent manager is introduced here.

If the host adds CSP, allow the AdCore origin for scripts, connections, and
tracking pixels, plus approved creative hosts for images/frames/media as needed.
The SDK uses inline styles. Do not add a second impression pixel or call
conversion tracking from this publisher slot.

Public hosting, app registration, funding, and live delivery require verification
against the deployed AdCore service; installing this component does not do those.

## Native sponsored cards

In AdCore's Sites & locations, enable **Also accept native sponsored cards** for
`tlr_home_banner`. Create an approved Native sponsored card with a headline and
select that location. Display compatibility and the placement key are preserved.

`app/globals.css` imports `app/lowe-report-ads.css`; the homepage wrapper uses
`tlr-native-ad` for orange accents and serif headings, reserving 280px while
loading. The SDK loads `/adcore-native.css` automatically. Preserve the Sponsored
and advertiser disclosure. Cards use a side-by-side layout at slot widths of
540px and above and stack at narrower widths; images crop to 16:10.

No CSP is declared in the site's current configuration. If the host/proxy adds
one, also allow `https://vcmadcore.com` in `style-src`, keeping existing script,
connection, image, and tracking allowances.
