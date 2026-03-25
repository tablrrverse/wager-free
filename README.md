# WagerFree tablrr Demo

A ready-to-deploy affiliate site example built with [tablrr](https://tablrr.app). Fork it, add your API token, and you have a live casino listing page in minutes.

## What's included

- A fully designed landing page (`index.html`) with your tablrr listing embedded in it
- The listing loads server-side — visitors and the Gooblebot see content instantly
- Automatic click and view tracking, so your tablrr dashboard stays up to date
- Hosted for free on Cloudflare Pages

## How to deploy

You'll need a free [Cloudflare account](https://dash.cloudflare.com/sign-up) and your tablrr API token (find it in your tablrr dashboard under Settings).

1. **Update the listing ID** — open `index.html` and find the line with `data-listing-id="..."`. Replace the value with your own listing ID from your tablrr dashboard.

2. **Edit the page content** — open `index.html` and customize the text, headings, colors, and any sections to match your brand.

3. **Add your verification file** — log in to your tablrr dashboard, go to Settings → Domain Verification, and download your `tablrr-verify.txt`. Replace the existing one in this folder with yours.

4. **Push to GitHub or GitLab** — create a new repository and push this folder to it.

5. **Create a Cloudflare Pages project** — in the Cloudflare dashboard go to **Pages → Create a project**, connect your repository, and leave the build command blank. Hit deploy.

6. **Add your API token** — after the first deploy, go to your Pages project **Settings → Environment variables → Add variable**:
    - Name: `TABLRR_TOKEN`
    - Value: your tablrr API token (find it in tablrr under Settings)
    - Type: **Secret** (keeps it private and out of logs)

7. **Redeploy** — trigger a new deploy from the Cloudflare Pages dashboard. Your site is now live with your listing injected.

## Files

| File                           | What it does                                                                        |
| ------------------------------ | ----------------------------------------------------------------------------------- |
| `index.html`                   | The page your visitors see                                                          |
| `tablrr.js`                    | Tracks clicks and listing views                                                     |
| `tablrr-verify.txt`            | Domain ownership verification                                                       |
| `functions/_middleware.js`     | Fetches your listing from tablrr and injects it before the page is sent to visitors |
| `functions/api/track-click.js` | Records affiliate link clicks                                                       |
| `functions/api/track-view.js`  | Records when a visitor scrolls to a listing                                         |

## Refreshing the listing

Your listing data is cached for 1 year so the page loads as fast as possible. When you update your listing in tablrr and want the site to reflect the changes immediately, visit your site with `?no_cache` added to the URL:

```
https://your-site.pages.dev/?no_cache
```

That clears the old cache and loads fresh data. All future visits will use the new version. Or you could set the cache duration shorter and it will auto-clear first time someone visits your site after the cache lifetime expiry.
