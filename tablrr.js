const VIEW_CACHE_KEY = "tablrr_views";
const VIEW_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function _loadViewCache() {
  try {
    return JSON.parse(localStorage.getItem(VIEW_CACHE_KEY) || "{}");
  } catch {
    return {};
  }
}

function _hasViewed(id) {
  const cache = _loadViewCache();
  return cache[id] && Date.now() - cache[id] < VIEW_CACHE_TTL;
}

function _markViewed(id) {
  const cache = _loadViewCache();
  cache[id] = Date.now();
  localStorage.setItem(VIEW_CACHE_KEY, JSON.stringify(cache));
}

const _viewed = new Set();
const _observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const id = entry.target.dataset.listingId;
      if (_viewed.has(id) || _hasViewed(id)) continue;
      _viewed.add(id);
      _markViewed(id);
      _observer.unobserve(entry.target);
      navigator.sendBeacon(
        "/api/track-view",
        JSON.stringify({ listing_id: id, timestamp: Math.floor(Date.now() / 1000) }),
      );
    }
  },
  { threshold: 0.5 },
);

document.querySelectorAll("[data-listing-id]").forEach((el) => _observer.observe(el));

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
