export class ApiError extends Error {
  constructor({ status, code, message, details = [] }) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const REQUEST_TIMEOUT_MS = 8000;

async function request(path, { method = "GET", data, signal } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const abortRequest = () => controller.abort();

  if (signal?.aborted) controller.abort();
  else signal?.addEventListener("abort", abortRequest, { once: true });

  try {
    const response = await fetch(path, {
      method,
      signal: controller.signal,
      headers: data === undefined ? undefined : { "Content-Type": "application/json" },
      body: data === undefined ? undefined : JSON.stringify(data)
    });

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
  } catch (error) {
    if (error instanceof ApiError || signal?.aborted) throw error;
    if (timedOut) {
      throw new ApiError({
        status: 0,
        code: "REQUEST_TIMEOUT",
        message: "The server did not respond within 8 seconds"
      });
    }
    if (error.name === "AbortError") throw error;
    throw new ApiError({
      status: 0,
      code: "NETWORK_ERROR",
      message: "Cannot reach the server"
    });
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", abortRequest);
  }
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
