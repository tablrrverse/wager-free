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

  const { listing_id, operator_id, click_type } = body;
  if (
    !listing_id ||
    !operator_id ||
    !["affiliate", "terms"].includes(click_type)
  ) {
    return new Response(null, { status: 400 });
  }

  const res = await fetch("https://api.tablrr.app/v1/analytics/clicks", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${context.env.TABLRR_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      public_id: listing_id,
      operator_id: parseInt(operator_id, 10),
      click_type,
      timestamp: Math.floor(Date.now() / 1000),
    }),
  });

  return new Response(null, { status: res.status });
}
