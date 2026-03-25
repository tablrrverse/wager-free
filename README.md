# wager-free

Example affiliate site built with [tablrr](https://tablrr.app), deployed on Cloudflare Pages with server-side rendered listings.

## How it works

The listing (`<div data-listing-id="...">`) is injected server-side by a Cloudflare Pages Function middleware before the HTML reaches the browser — no client-side fetch, no layout shift. The embed response is cached at the edge for 1 year.

## Deploy

1. Push this directory to a GitHub/GitLab repo
2. Create a new Cloudflare Pages project, point it at the repo, no build command needed
3. Set the `TABLRR_TOKEN` secret: **Settings → Environment variables → Add variable** (type: Secret)
4. Deploy

## Project structure

```
├── index.html                     # Static page with data-listing-id placeholder
├── tablrr.js                      # Click tracking + intersection-observer view tracking
├── tablrr-verify.txt              # Domain verification token
└── functions/
    ├── _middleware.js             # SSR: fetches & injects listing embed into HTML
    └── api/
        ├── track-click.js         # POST /api/track-click
        └── track-view.js          # POST /api/track-view
```

## Cache

Embed responses are cached at the edge for 1 year via `caches.default`.

To bust the cache and fetch fresh data, append `?no_cache` to any page URL:

```
https://your-site.pages.dev/?no_cache
```

## Local development

```sh
npm install -g wrangler
wrangler pages dev . --binding TABLRR_TOKEN=your_token_here
```
