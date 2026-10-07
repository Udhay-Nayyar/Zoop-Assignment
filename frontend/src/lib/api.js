export class ApiError extends Error {
  constructor({ status, code, message, details = [] }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function request(path, { method = "GET", data, signal } = {}) {
  let response;
  try {
    response = await fetch(path, {
      method,
      signal,
      headers: data === undefined ? undefined : { "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data)
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Cannot reach the server"
    });
  }

  if (response.status === 204) return undefined;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = body?.error || {};
    throw new ApiError({
      status: response.status,
      code: error.code || "REQUEST_FAILED",
      message: error.message || "The request could not be completed",
      details: error.details || []
    });
  }
  return body;
}

function queryString(params = {}) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const serialized = search.toString();
  return serialized ? `?${serialized}` : "";
}

export function listAgents(params, { signal } = {}) {
  return request(`/api/agents${queryString(params)}`, { signal });
}

export function getAgent(id, { signal } = {}) {
  return request(`/api/agents/${encodeURIComponent(id)}`, { signal });
}

export function createAgent(data) {
  return request("/api/agents", { method: "POST", data });
}

export function updateAgent(id, data) {
  return request(`/api/agents/${encodeURIComponent(id)}`, { method: "PATCH", data });
}

export function deleteAgent(id) {
  return request(`/api/agents/${encodeURIComponent(id)}`, { method: "DELETE" });
}
