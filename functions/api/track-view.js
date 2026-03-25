export async function onRequest(context) {
  if (context.request.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  let body;
  try {
    body = await context.request.json();
  } catch {
    return new Response(null, { status: 400 });
  }

  const { listing_id, timestamp } = body;
  if (!listing_id) {
    return new Response(null, { status: 400 });
  }

  const res = await fetch("https://api.tablrr.app/v1/analytics/views", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.env.TABLRR_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_id: listing_id,
      timestamp: timestamp ?? Math.floor(Date.now() / 1000),
    }),
  }).catch((err) => {
    console.error(`[tablrr] view tracking failed for ${listing_id}: ${err.message}`);
    return new Response(null, { status: 502 });
  });

  return new Response(null, { status: res.status });
}
