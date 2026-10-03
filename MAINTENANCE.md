# Map maintenance and operational configuration

This is a draft maintenance change, not a ready-to-deploy service migration.
No real Azure records, geolocation, map tiles, or child-named data files were read
or tested. Existing privacy text and data files are untouched. The build copies
only the approved privacy page and configuration file, never the child datasets.

## Owner configuration required before deployment

The legacy `WindowsAzure.MobileServiceClient(endpoint, applicationKey)` and
`getTable('HospitalAdultItem').read()` contract are preserved in a configurable
adapter. The tracked historical application-key literal is no longer embedded.
Its validity and sensitivity were not tested; an Azure public-client application
identifier is not automatically a secret or evidence of a credential leak.

The owner must verify that the legacy service remains usable and provide approved
public-client configuration as `window.goodPlaceConfig` in config.js (endpoint and
applicationKey), or explicitly choose a replacement `window.goodPlaceDataProvider`
function returning the same record array. Do not put secrets in a browser config.
No endpoint, key, authentication, or replacement backend is chosen by this PR.
Missing configuration fails visibly and does not contact the service.

The original Microsoft SDK version is retained only in this legacy adapter; modern
Azure Mobile Apps SDKs are not a drop-in replacement for the classic service.
The HTTPS Microsoft CDN source was verified with HTTP200 on 2026-10-03:
https://ajax.aspnetcdn.com/ajax/mobileservices/MobileServices.Web-1.1.3.min.js
SDK loading is bounded and reports failures. Actual backend compatibility remains
an owner verification requirement, with synthetic constructor/table-read tests.

## Build and tests

Node24: `npm ci --ignore-scripts`, `npm run build`, `npm run preview`, `npm test`.
Leaflet1.9.4 (latest stable public package) is bundled locally. The old duplicate
Bootstrap/jQuery code is replaced only for its navigation toggle/text updates by
small native DOM code and equivalent layout CSS, not a new framework.

Tests use actual Leaflet and synthetic providers, block all non-local browser
traffic, mock geolocation denial, and cover missing/empty/invalid/failed data,
legacy adapter contract, coordinate validation, safe popup text, click summaries,
keyboard zoom, and mobile navigation. Screenshots are retained by exact-head
read-only CI. Tile failures show a status; the live map provider remains HTTPS.
