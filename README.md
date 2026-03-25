# WagerFree tablrr Demo

A ready-to-deploy affiliate website example built with [tablrr](https://tablrr.app). Fork it, add your API token, and you have a live casino listing page in minutes.

**tablrr** is a tool that manages your affiliate listings, bonuses, ratings, payout speeds, etc. and embeds them into your websites automatically. This example shows how to do that on a real, production-ready page.

## What's included

- A fully designed landing page (`index.html`) with your tablrr listing embedded in it
- The listing loads server-side — visitors and the Googlebot see content instantly
- Automatic listing view and link click tracking
- Hosting for free on Cloudflare Pages

## Before you start

You'll need three accounts. Set these up first if you don't have them already:

- **[tablrr](https://tablrr.app)** — where your casino listings live. You'll need your **listing ID** (from the listing's page in your dashboard) and your **API token** (from Settings - Sites).
- **[GitHub](https://github.com/signup)** — where you store and publish the website files. - You can skip this and use a drag and drop deploy option for Cloudflare Pages.
- **[Cloudflare](https://dash.cloudflare.com/sign-up)** — where the website runs for free.

## How to deploy

### 1. Download or fork this folder

If you're comfortable with Git, fork or clone this repo. Otherwise, click **Code → Download ZIP** on GitHub, unzip it, and you have the files on your computer.

### 2. Update the listing ID

Open `index.html` in any text editor (Notepad, TextEdit, VS Code — anything works). Find this line:

```html
<div data-listing-id="o6wiKF5RmBIx2Ny3" class="p-6"></div>
```

Replace `o6wiKF5RmBIx2Ny3` with your own listing ID from your tablrr dashboard.

### 3. Edit the page content

Still in `index.html`, customize the text, headings, colors, and sections to match your brand. The only important parts are:

- the listing line (you can add more, e.g. `<div data-listing-id="ANOTHER_LISTING_ID"></div>`)
- and the `<script src="/tablrr.js" defer></script>` link at the very end of the file.

Everything else is up to you.

### 4. Add your domain verification file

Log in to tablrr, go to **Settings → Add Site**, copy The **Verification code** and paste it in `tablrr-verify.txt`. Replace the existing code with yours.

### 5. Upload to GitHub

You need the files in a GitHub repository so Cloudflare can deploy them.

**If you're not familiar with Git**, the easiest way is GitHub's web uploader:

1. Go to [github.com/new](https://github.com/new) and create a new repository (name it anything, keep it public).
2. On the next screen, click **uploading an existing file**.
3. Drag all the files from this folder into the upload area — include the `functions/` folder too.
4. Click **Commit changes**.

### 6. Create a Cloudflare Pages project

1. Log in to Cloudflare and go to **Compute → Workers & Pages → Create a project**.
2. Choose Cloudflare Pages
3. Connect your GitHub account and select the repository you just created.
4. Leave the build command blank — no build step is needed.
5. Click **Save and Deploy**.

### 7. Add your API token

After the first deploy finishes, go to your Pages project in Cloudflare and open **Settings → Environment variables → Add variable**:

| Field | Value                                                  |
| ----- | ------------------------------------------------------ |
| Name  | `TABLRR_TOKEN`                                         |
| Value | Your tablrr API token (found in tablrr under Settings) |
| Type  | **Secret** — keeps it private and out of logs          |

### 8. Redeploy

Trigger a new deploy from the Cloudflare Pages dashboard (**Deployments → Retry deploy**). Your website is now live with your listing injected.

## Files

The only files you need to edit are `index.html` and `tablrr-verify.txt`. The rest power the website behind the scenes — leave them as-is.

| File                           | What it does                                                                        | Edit it?                 |
| ------------------------------ | ----------------------------------------------------------------------------------- | ------------------------ |
| `index.html`                   | The page your visitors see                                                          | Yes                      |
| `tablrr-verify.txt`            | Proves you own the domain                                                           | Yes — replace with yours |
| `tablrr.js`                    | Tracks clicks and listing views                                                     | No                       |
| `functions/_middleware.js`     | Fetches your listing from tablrr and injects it before the page is sent to visitors | No                       |
| `functions/api/track-click.js` | Records affiliate link clicks                                                       | No                       |
| `functions/api/track-view.js`  | Records when a visitor scrolls to a listing                                         | No                       |

## Refreshing the listing

Your listing data is cached so the page loads as fast as possible. When you update your listing in tablrr and want the website to reflect the changes straight away, visit your website with `?no_cache` added to the URL:

```
https://your-site.pages.dev/?no_cache
```

That clears the old cache and loads fresh data. All future visits will use the new version.
