export async function onRequest(context) {
  const url = new URL(context.request.url);
  const response = await context.next();

  // Only process HTML responses
  if (!response.headers.get("content-type")?.includes("text/html")) {
    return response;
  }

  // Bail early with a clear error if the token is missing
  if (!context.env.TABLRR_TOKEN) {
    console.error(
      "[tablrr] TABLRR_TOKEN secret is not set — listing will be empty",
    );
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

  console.log(
    `[tablrr] ${url.pathname} — found listing IDs: ${listingIds.join(", ")}`,
  );

  // Fetch all listings in parallel, using explicit Cache API
  const cache = caches.default;
  const noCache = url.searchParams.has("no_cache");
  const embedMap = new Map();
  await Promise.all(
    listingIds.map(async (id) => {
      try {
        const cacheKey = new Request(
          `https://api.tablrr.app/v1/listings/${id}/embed`,
        );

        if (noCache) await cache.delete(cacheKey);

        let data;
        const cached = !noCache && await cache.match(cacheKey);
        if (cached) {
          console.log(`[tablrr] listing ${id} — cache hit`);
          data = await cached.json();
        } else {
          console.log(`[tablrr] listing ${id} — ${noCache ? "no_cache, " : ""}fetching`);
          const res = await fetch(cacheKey, {
            headers: { Authorization: `Bearer ${context.env.TABLRR_TOKEN}` },
          });
          if (!res.ok) {
            const body = await res.text();
            console.error(
              `[tablrr] listing ${id} — API error ${res.status}: ${body.slice(0, 200)}`,
            );
            return;
          }
          data = await res.json();
          context.waitUntil(
            cache.put(
              cacheKey,
              new Response(JSON.stringify(data), {
                headers: { "Cache-Control": "max-age=31536000" },
              }),
            ),
          );
        }

        if (!data.html) {
          console.warn(
            `[tablrr] listing ${id} — response OK but missing html field:`,
            JSON.stringify(data).slice(0, 200),
          );
        }
        embedMap.set(id, data);
      } catch (err) {
        console.error(`[tablrr] listing ${id} — fetch threw: ${err.message}`);
      }
    }),
  );

  console.log(
    `[tablrr] embed fetch done — resolved: ${embedMap.size}/${listingIds.length}`,
  );

  // Aggregate CSS, JS, and structured data across all listings
  const css = listingIds
    .map((id) => embedMap.get(id)?.css)
    .filter(Boolean)
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  const js = listingIds
    .map((id) => embedMap.get(id)?.js)
    .filter(Boolean)
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .trim();
  const structuredData = listingIds
    .map((id) => embedMap.get(id)?.structured_data)
    .filter(Boolean)
    .map(
      (sd) =>
        `<script type="application/ld+json">${JSON.stringify(sd)}<\/script>`,
    )
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
        if (css) el.append(`<style>${css}</style>`, { html: true });
        if (structuredData) el.append(structuredData, { html: true });
      },
    })
    .on("body", {
      element(el) {
        if (js) el.append(`<script>${js}<\/script>`, { html: true });
      },
    })
    .transform(response);
}
