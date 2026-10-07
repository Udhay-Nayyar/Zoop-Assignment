# Production deployment

This guide deploys the backend, PostgreSQL, Redis, and Nginx on one Ubuntu EC2
instance. The frontend remains separate and calls the EC2 API through its
server-side `/api/*` rewrite. PostgreSQL, Redis, and the backend use the single
internal network; Nginx also joins a dedicated edge network so Docker can
publish its HTTP port without exposing the data services.

## 1. Create the EC2 instance

Create an EC2 instance with:

- Ubuntu Server 22.04 LTS or 24.04 LTS.
- Instance type `t3.small`.
- A 20 GB `gp3` root volume.
- A key pair that you can access.

Configure its security group with inbound rules:

| Port | Source |
| --- | --- |
| 22 (SSH) | Your public IP only |
| 80 (HTTP) | Anywhere (`0.0.0.0/0`, and `::/0` if using IPv6) |
| 443 (later HTTPS) | Anywhere when TLS is configured |

Do **not** open ports 3000, 5432, or 6379. PostgreSQL and Redis have no
published ports, and the backend is reachable only through Nginx on the Docker
network.

## 2. Install Docker and fetch the project

SSH to the instance, install Docker Engine and the Compose plugin, then log out
and back in so your Docker group membership takes effect:

```sh
ssh -i <key-pair.pem> ubuntu@<EC2_IP>
sudo apt-get update
sudo apt-get install -y git
git clone <repository-url> delivery-agent-management
cd delivery-agent-management
./deploy/setup-ec2.sh --with-swap
```

The `--with-swap` option creates an idempotent 1 GB swapfile. Omit it if swap
is not wanted. Reconnect after setup, then enter the project directory again.

## 3. Configure production environment

Create the Compose interpolation environment file and backend runtime file.
Use a unique database password; generate one with:

```sh
openssl rand -base64 24
```

Edit both copied files and replace every placeholder. The database credentials
must agree, and backend connection URLs must use `postgres` and `redis` (the
Compose service names), not `localhost`. Percent-encode any reserved
characters from the generated password when placing it in `DATABASE_URL`.

```sh
cp .env.production.example .env
cp backend/.env.production.example backend/.env.production
chmod 600 .env backend/.env.production
```

`CORS_ORIGINS` can remain empty when the deployed frontend uses the Next.js
server-side rewrite. If direct browser-to-API requests are needed, set it to a
comma-separated list of exact origins.

## 4. Deploy and check the API

```sh
./deploy/deploy.sh
```

The script fast-forwards the current Git branch, builds the backend image,
waits for healthy services, runs idempotent migrations, shows service status,
and requests the health and list endpoints. Check externally as well:

```sh
curl -i http://<EC2_IP>/health
curl -i 'http://<EC2_IP>/api/agents?limit=1'
```

Health should report both database and Redis as `up`. The first list request
should include `X-Cache: MISS`; repeat it for `X-Cache: HIT`. Patch an agent
using its ID, then repeat the list request: it should be a `MISS` and contain
fresh data. The optional sample seed is idempotent:

```sh
docker compose -f docker-compose.prod.yml exec backend npm run seed
```

Allocate and associate an Elastic IP with the instance so the frontend's
backend address remains stable across instance stops and starts.

## 5. Deploy the frontend separately

### Vercel

1. Import the repository.
2. Set **Root Directory** to `frontend`.
3. Set `VITE_API_URL` to `http://54.161.105.66` (or the backend's stable public
   IP/domain).
4. Deploy. Redeploy after changing `VITE_API_URL`; Next.js rewrites are
   evaluated at build time.

### Render

1. Create a Web Service from the repository and set **Root Directory** to
   `frontend`.
2. Set the build command to `npm install && npm run build`.
3. Set the start command to `npm start`.
4. Set `VITE_API_URL` to `http://54.161.105.66` (or the backend's stable public
   IP/domain) and deploy.

Render's free tier may have cold starts. If a platform rejects a raw IP as a
backend URL, use a hostname such as a `nip.io` name or a real domain. HTTPS can
optionally be added with Certbot; configure Nginx's HTTPS server block and
publish port 443 only after certificates and redirects have been verified.

## Operations

### Redeploy and roll back

Redeploy the current branch with `./deploy/deploy.sh`. To roll back, check out
the desired previous commit on the instance and rebuild/restart:

```sh
git checkout <previous-commit>
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --wait
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
```

### Logs and resource usage

```sh
docker compose -f docker-compose.prod.yml logs --tail=200 -f backend nginx
docker stats
```

Docker's `json-file` logs rotate at 10 MB per file and retain three files per
service.

### Database backup and restore

Create a compressed dump; the script retains the seven newest backups:

```sh
./deploy/backup-db.sh
```

Restore a dump into the production database during a maintenance window:

```sh
gzip -dc ./backups/agents-<timestamp>.sql.gz \
  | docker compose -f docker-compose.prod.yml exec -T postgres \
      sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
```

### Reset the database

This permanently deletes all production agent records and migration history.
Stop the stack, remove only its PostgreSQL volume, then start and migrate it:

```sh
docker compose -f docker-compose.prod.yml down
docker volume ls
docker volume rm delivery-agent-management_postgres_data
docker compose -f docker-compose.prod.yml up -d --wait
docker compose -f docker-compose.prod.yml --profile tools run --rm migrate
```

Confirm the actual volume name with `docker volume ls` before removing it.
Avoid `down -v` if Redis cache persistence or other project volumes should be
retained.

## Troubleshooting

- **Connection timeout:** verify the instance security group permits inbound
  HTTP on port 80 from your client. Do not open internal service ports.
- **Nginx returns 502:** inspect backend health and logs with
  `docker compose -f docker-compose.prod.yml ps` and `logs backend`.
- **Backend cannot reach PostgreSQL or Redis:** use the Compose hostnames
  `postgres` and `redis` in `backend/.env.production`; container `localhost`
  refers to the backend container itself.
- **Build runs out of memory:** enable the optional 1 GB swap using
  `./deploy/setup-ec2.sh --with-swap`, or build elsewhere and transfer/pull
  the image.
- **Frontend reaches the wrong backend:** update `VITE_API_URL` in the hosting
  provider and redeploy; changing the variable without rebuilding does not
  update Next.js rewrites.
- **Disk full:** inspect `df -h`, Docker images/volumes, and `backups/`; retain
  required dumps before removing obsolete local artifacts.
- **Migration fails:** check PostgreSQL health, connection URL credentials,
  Compose logs, and available disk space before retrying the migration.

## Limitations

This deployment is a single-instance setup and therefore a single point of
failure. For larger workloads, move PostgreSQL to RDS and Redis to ElastiCache,
and consider multi-instance deployment. The application does not yet include
authentication; restrict access appropriately until it is added.
