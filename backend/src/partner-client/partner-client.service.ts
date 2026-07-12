import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface PartnerJobPayload {
  b2cBookingRef: string;
  serviceType: string;
  jobDate: string;
  pickupTime?: string | null;
  fromZoneId: string;
  toZoneId: string;
  originAirportId?: string | null;
  destinationAirportId?: string | null;
  hotelId?: string | null;
  paxCount: number;
  vehicleTypeId: string;
  flightNo?: string | null;
  carrier?: string | null;
  terminal?: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry?: string | null;
  paymentMethod: string;
  total: number;
  currency?: string;
  extras?: Array<{
    extraId?: string | null;
    name: string;
    qty: number;
    unitAmount: number;
    currency: string;
  }>;
  notes?: string | null;
  pickupPlaceId?: string | null;
  pickupLat?: number | null;
  pickupLng?: number | null;
  pickupAddress?: string | null;
  dropoffPlaceId?: string | null;
  dropoffLat?: number | null;
  dropoffLng?: number | null;
  dropoffAddress?: string | null;
}

export interface PartnerJobResult {
  jobRef: string;
  iTourTTJobId: string;
  status: string;
}

/**
 * The B2C standalone's outbound client to iTourTT's /api/partner/* seam.
 * See PARTNER-API-CONTRACT.md. Uses native fetch (Node 20+), no HTTP dep.
 * Retries transient failures with backoff; callers treat a thrown error as
 * "not synced" and keep the booking locally as SYNC_PENDING.
 */
@Injectable()
export class PartnerClientService {
  private readonly logger = new Logger(PartnerClientService.name);
  private readonly baseUrl: string;
  private readonly key: string;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = (
      this.config.get<string>('ITOURTT_API_URL') ?? 'http://localhost:3001'
    ).replace(/\/$/, '');
    this.key = this.config.get<string>('PARTNER_API_KEY') ?? '';
  }

  private async call<T>(
    method: 'GET' | 'POST',
    path: string,
    body?: unknown,
    retries = 2,
  ): Promise<T> {
    const url = `${this.baseUrl}/api${path}`;
    let lastErr: unknown;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          method,
          headers: {
            'X-Partner-Key': this.key,
            ...(body ? { 'Content-Type': 'application/json' } : {}),
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(`partner ${method} ${path} -> ${res.status} ${text}`);
        }
        return (await res.json()) as T;
      } catch (err) {
        lastErr = err;
        if (attempt < retries) {
          const backoff = 300 * 2 ** attempt;
          await new Promise((r) => setTimeout(r, backoff));
        }
      }
    }
    this.logger.error(`partner call failed: ${method} ${path}: ${String(lastErr)}`);
    throw lastErr;
  }

  getReference(): Promise<{
    version: string | null;
    locations: Array<{ id: string; type: string; name: string; parentId: string | null }>;
    vehicleTypes: Array<{ id: string; name: string; capacity: number; luggageCapacity: number | null; active: boolean }>;
    serviceTypes: string[];
  }> {
    return this.call('GET', '/partner/reference');
  }

  pushPricing(items: unknown[]): Promise<{ upserted: number }> {
    return this.call('POST', '/partner/pricing', { items });
  }

  createJob(payload: PartnerJobPayload): Promise<PartnerJobResult> {
    return this.call('POST', '/partner/jobs', payload);
  }

  getJobStatuses(refs: string[]): Promise<{
    jobs: Array<{ jobRef: string; status: string; driver: unknown; vehicle: unknown; updatedAt: string }>;
  }> {
    return this.call('GET', `/partner/jobs?refs=${encodeURIComponent(refs.join(','))}`);
  }
}
