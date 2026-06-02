# Deployment — B2C site (transferra.ae)

Standalone Docker deployment on its own VPS (`31.97.45.33`, Ubuntu 24.04),
behind host nginx. Talks to the existing backend at
`https://fulvago.itourtt.cloud/api`.

## Layout
- App container `itourtt-b2c` → listens `127.0.0.1:3000` (compose).
- Host nginx (`/etc/nginx/sites-available/transferra`) proxies `:80` → `:3000`,
  `server_name transferra.ae www.transferra.ae 31.97.45.33`.
- `NEXT_PUBLIC_API_URL=https://fulvago.itourtt.cloud` (build-arg + runtime env).

## First-time setup (already done)
1. Docker + Compose (preinstalled).
2. Deploy key on the GitHub repo → `git clone` to `/opt/iTourTT-B2CSite`.
3. `NEXT_PUBLIC_API_URL=https://fulvago.itourtt.cloud docker compose up -d --build`
4. nginx site config + `nginx -t && systemctl reload nginx`.
5. Backend CORS already allows this origin (prod `backend-secret`).

## Update / redeploy (after pushing new commits)
```bash
cd /opt/iTourTT-B2CSite
git pull
NEXT_PUBLIC_API_URL=https://fulvago.itourtt.cloud docker compose up -d --build
docker image prune -f
```

## Enable HTTPS — run AFTER DNS points transferra.ae → 31.97.45.33
```bash
apt-get install -y certbot python3-certbot-nginx
certbot --nginx -d transferra.ae -d www.transferra.ae
# certbot edits the nginx site to add :443 + auto-renews via systemd timer
```
Then drop the temporary `http://31.97.45.33` origin from the backend
`CORS_ORIGINS` secret.

## Useful
```bash
docker compose logs -f            # app logs
docker compose restart            # restart without rebuild
docker compose down               # stop
systemctl reload nginx            # after nginx config edits
```
