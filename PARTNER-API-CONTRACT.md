# Partner API Contract — iTourTT ↔ B2C (transferra.ae)

The seam between the **B2C standalone** (transferra.ae, own backend + DB) and
**iTourTT** (fulvago.itourtt.cloud, ops system). B2C is the SEO-agency-facing
system; the agency never gets iTourTT access. All coupling is these endpoints.

> Status: **frozen v1**. Both sides code against this. Changes need a version bump.

---

## Ownership

| Domain | Source of truth | Notes |
|---|---|---|
| SEO content (blog, city/static pages, page SEO, translations) | **B2C** | fully in B2C DB; iTourTT loses it |
| Website settings / branding | **B2C** | in B2C DB |
| Public pricing | **B2C** | edited in B2C admin → **pushed** to iTourTT for job costing |
| Extras (booking add-ons + prices) | **B2C** | in B2C DB; chosen extras travel with the job payload |
| Guest accounts + bookings | **B2C** | in B2C DB; a job is pushed to iTourTT per confirmed booking |
| Payments (PAY_ON_ARRIVAL at launch) | **B2C** | card gateway deferred |
| **Location tree** (country→airport→city→zone→hotel) | **iTourTT** | operational/dispatch; B2C **mirrors** read-only |
| **Vehicle types** (capacity, category) | **iTourTT** | B2C mirrors read-only |
| **Job service types** (ARR/DEP/CITY) | **iTourTT** | B2C mirrors read-only |
| Traffic jobs, dispatch, drivers, reps, finance, reports | **iTourTT** | agency never sees |

Pricing/booking in B2C reference iTourTT **zoneId / vehicleTypeId / serviceType**
by their iTourTT UUIDs (kept in the B2C mirror). No forking of the location tree.

---

## Auth

Machine-to-machine **service API key**. Not user JWT.

- B2C sends header: `X-Partner-Key: <key>`
- iTourTT validates via `PartnerKeyGuard` against `PARTNER_API_KEY` (env; hashed compare).
- Key scoped to `/api/partner/*` only. Rotatable. One key per partner (currently: B2C).
- All partner endpoints are HTTPS-only and rate-limited.

---

## Endpoints (on iTourTT), base `/api/partner`

### 1. `GET /api/partner/reference`
Reference data B2C mirrors. Polled periodically (e.g. hourly) + on-demand.

**200** →
```jsonc
{
  "version": "2026-07-12T10:00:00Z",   // bump when any reference changes
  "locations": [
    { "id": "uuid", "type": "COUNTRY|AIRPORT|CITY|ZONE|HOTEL",
      "name": "…", "parentId": "uuid|null" }
  ],
  "vehicleTypes": [
    { "id": "uuid", "name": "Sedan", "capacity": 3, "category": "…", "active": true }
  ],
  "serviceTypes": ["ARR", "DEP", "CITY"]
}
```
B2C caches this; if `version` unchanged, skip re-import.

### 2. `POST /api/partner/pricing`
B2C pushes public price lists. Idempotent **upsert** keyed by (zoneId, vehicleTypeId, serviceType).

**Body** →
```jsonc
{
  "effectiveFrom": "2026-07-12",
  "currency": "USD",
  "prices": [
    { "zoneId": "uuid", "vehicleTypeId": "uuid", "serviceType": "ARR", "amount": 45.00 }
  ]
}
```
**200** → `{ "upserted": 128, "skipped": 0 }`
iTourTT stores these as the prices used when costing pushed jobs.

### 3. `POST /api/partner/jobs`
B2C creates a job from a **confirmed** booking. Reuses iTourTT's existing
guest-booking→traffic-job conversion logic on the iTourTT side.

**Body** →
```jsonc
{
  "b2cBookingRef": "TRF-000123",           // B2C's own ref (idempotency key)
  "serviceType": "ARR",
  "pickup":  { "zoneId": "uuid", "hotelId": "uuid|null", "text": "…" },
  "dropoff": { "zoneId": "uuid", "hotelId": "uuid|null", "text": "…" },
  "scheduledAt": "2026-07-20T14:30:00Z",
  "flight": { "number": "MS777", "time": "2026-07-20T14:00:00Z" },  // nullable
  "pax": 3,
  "vehicleTypeId": "uuid",
  "extras": [ { "code": "child-seat", "qty": 1, "label": "Child seat" } ],
  "passenger": { "name": "…", "phone": "…", "email": "…" },
  "priceSnapshot": { "currency": "USD", "amount": 45.00 },  // B2C-computed price
  "source": "B2C:transferra"
}
```
**201** → `{ "jobRef": "ITT-JOB-0456", "iTourTTJobId": "uuid", "status": "PENDING" }`
Idempotent on `b2cBookingRef` — resending returns the existing job.

### 4. `GET /api/partner/jobs?refs=ITT-JOB-0456,ITT-JOB-0457`
Status poll for B2C's open bookings. B2C runs this on a schedule.

**200** →
```jsonc
{
  "jobs": [
    { "jobRef": "ITT-JOB-0456", "status": "ASSIGNED",
      "driver": { "name": "…", "phone": "…" } | null,
      "vehicle": { "plate": "…", "type": "Sedan" } | null,
      "updatedAt": "2026-07-20T13:10:00Z" }
  ]
}
```
Status enum mirrors iTourTT job lifecycle (PENDING, ASSIGNED, IN_PROGRESS,
COMPLETED, CANCELLED, NO_SHOW).

---

## B2C-side responsibilities
- `partner-client` service wrapping the 4 calls with the key + retries/backoff.
- Scheduled **reference mirror** refresh (GET /reference → upsert mirror tables).
- Scheduled **status poller** (GET /jobs for open bookings → update local status).
- On booking confirm: persist in B2C DB, then `POST /partner/jobs`; store returned jobRef.
- On pricing save in admin: `POST /partner/pricing`.

## Failure handling
- Partner calls retried with backoff; failures queued, not lost (booking still saved locally as `SYNC_PENDING`).
- iTourTT down ≠ booking lost — it syncs when reachable.
- Pricing push failure surfaces in B2C admin as "not synced to ops".
