export async function onRequest(context) {
  const url = new URL(context.request.url);
  const response = await context.next();

  // Only process HTML responses
  if (!response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }

  // Bail early with a clear error if the token is missing
  if (!context.env.TABLRR_TOKEN) {
    console.error("[tablrr] TABLRR_TOKEN secret is not set — listing will be empty");
    return response;
  }

  // Scan for listing IDs (clone so the original stream is free to transform)
  const listingIds = [];
  await new HTMLRewriter()
    .on("[data-listing-id]", {
      element(el) {
        const id = el.getAttribute("data-listing-id");
        if (id && !listingIds.includes(id)) listingIds.push(id);
      },
    })
    .transform(response.clone())
    .arrayBuffer();

  if (listingIds.length === 0) {
    console.log(`[tablrr] ${url.pathname} — no data-listing-id elements found`);
    return response;
  }

  console.log(`[tablrr] ${url.pathname} — found listing IDs: ${listingIds.join(", ")}`);

  // Fetch all listings in parallel, using Cloudflare's cache
  const embedMap = new Map();
  await Promise.all(
    listingIds.map(async (id) => {
      try {
        const res = await fetch(
          `https://api.tablrr.app/v1/listings/${id}/embed`,
          {
            headers: { Authorization: `Bearer ${context.env.TABLRR_TOKEN}` },
            cf: { cacheTtl: 3600, cacheEverything: true },
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (!data.html) {
            console.warn(`[tablrr] listing ${id} — response OK but missing html field:`, JSON.stringify(data).slice(0, 200));
          }
          embedMap.set(id, data);
        } else {
          const body = await res.text();
          console.error(`[tablrr] listing ${id} — API error ${res.status}: ${body.slice(0, 200)}`);
        }
      } catch (err) {
        console.error(`[tablrr] listing ${id} — fetch threw: ${err.message}`);
      }
    })
  );

  console.log(`[tablrr] embed fetch done — resolved: ${embedMap.size}/${listingIds.length}`);

  // Track views for all listings (fire and forget)
  context.waitUntil(
    Promise.all(
      listingIds.map((id) =>
        fetch("https://api.tablrr.app/v1/analytics/views", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${context.env.TABLRR_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            public_id: id,
            timestamp: Math.floor(Date.now() / 1000),
          }),
        }).catch((err) => console.error(`[tablrr] view tracking failed for ${id}: ${err.message}`))
      )
    )
  );

  // Aggregate CSS, JS, and structured data across all listings
  const allCss = listingIds
    .map((id) => embedMap.get(id)?.css)
    .filter(Boolean)
    .join("\n");
  const allJs = listingIds
    .map((id) => embedMap.get(id)?.js)
    .filter(Boolean)
    .join("\n");
  const structuredData = listingIds
    .map((id) => embedMap.get(id)?.structured_data)
    .filter(Boolean)
    .map((sd) => `<script type="application/ld+json">${JSON.stringify(sd)}<\/script>`)
    .join("");

  return new HTMLRewriter()
    .on("[data-listing-id]", {
      element(el) {
        const id = el.getAttribute("data-listing-id");
        const embed = embedMap.get(id);
        if (embed?.html) {
          el.setInnerContent(embed.html, { html: true });
        } else {
          console.warn(`[tablrr] no html to inject for listing ${id}`);
        }
      },
    })
    .on("head", {
      element(el) {
        if (allCss) el.append(`<style>${allCss}</style>`, { html: true });
        if (structuredData) el.append(structuredData, { html: true });
      },
    })
    .on("body", {
      element(el) {
        if (allJs) el.append(`<script>${allJs}<\/script>`, { html: true });
      },
    })
    .transform(response);
}
