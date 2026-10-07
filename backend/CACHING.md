# Redis caching

Redis is an optional optimization. The backend continues serving requests from
PostgreSQL when Redis is unavailable or a cache operation fails.

## Cached data

| Key | TTL | Purpose |
| --- | --- | --- |
| `agent:<id>` | 300 seconds | Individual agent record |
| `agents:list:v<ver>:<query>` | 60 seconds | Agent list for a normalized query |
| `agents:list:version` | None | Monotonic list-cache invalidation counter |

TTL values are configured with `CACHE_TTL_AGENT_SECONDS` and
`CACHE_TTL_LIST_SECONDS`.

## Read and write flows

Reads use cache-aside: check Redis first, load a miss from PostgreSQL, then
attempt to cache the result. Not-found agent records are not cached.

Writes always commit through PostgreSQL first, then invalidate Redis. Write
responses are not cached.

| Operation | Database action | Cache invalidation after success |
| --- | --- | --- |
| Create | Insert agent | Increment `agents:list:version` |
| Update | Update agent | Delete `agent:<id>`, then increment list version |
| Delete | Delete agent | Delete `agent:<id>`, then increment list version |

List entries include the version counter in their key. Incrementing the counter
makes all prior list entries unreachable without scanning or issuing `KEYS`
against Redis, which avoids an expensive keyspace operation as the cache grows.
The counter itself has no TTL.

Each page, filter, and sort combination receives its own list key. Query
parameters are sorted before encoding, and `q` and `serviceArea` are
lowercased in the key so equivalent casing shares an entry. For example:

- `agents:list:v7:limit=10&order=desc&page=1&sortBy=createdAt`
- `agents:list:v7:limit=5&order=desc&page=2&sortBy=fullName`
- `agents:list:v7:limit=10&order=desc&page=1&serviceArea=whitefield&sortBy=createdAt&status=active`

The list version bump invalidates all filter/sort/page combinations at once;
old-version keys become unreachable and expire through their TTL.

If Redis is down, cache reads are treated as misses, writes/invalidation are
best-effort, and database-backed responses continue normally.

## Tradeoffs

- A reader that fetched old data immediately before a write may store it after
  invalidation. The relevant cache TTL bounds how long that stale entry can be
  served.
- If Redis is down during a write, invalidation is skipped and existing
  entries can remain stale until their TTL expires after Redis returns.
