document.addEventListener(
  "click",
  (e) => {
    const link = e.target.closest("a[data-link-type]");
    if (!link) return;

    const row = link.closest("[data-operator-id]");
    const container = link.closest("[data-listing-id]");
    if (!row || !container) return;

    navigator.sendBeacon(
      "/api/track-click",
      JSON.stringify({
        listing_id: container.dataset.listingId,
        operator_id: parseInt(row.dataset.operatorId, 10),
        click_type: link.dataset.linkType,
      }),
    );
  },
  { passive: true },
);
