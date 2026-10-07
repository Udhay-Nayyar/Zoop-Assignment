function agentKey(id) {
  return `agent:${id}`;
}

const listVersionKey = "agents:list:version";

function normalizeListQuery(query = {}) {
  const entries = Object.entries(query || {})
    .map(([key, value]) => {
      if ((key === "q" || key === "serviceArea") && typeof value === "string") {
        return [key, value.trim().toLowerCase()];
      }
      return [key, value];
    })
    .filter(([, value]) => value !== undefined && value !== null && value !== "");

  if (entries.length === 0) return "all";

  // Sorting ensures ?page=1&status=active and ?status=active&page=1 share a key.
  entries.sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0));
  return entries
    .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
    .join("&");
}

function listKey(version, normalizedQuery) {
  return `agents:list:v${version}:${normalizedQuery}`;
}

module.exports = {
  agentKey,
  listVersionKey,
  listKey,
  normalizeListQuery
};
