import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service.js';
import { PartnerClientService } from '../partner-client/partner-client.service.js';

// Job lifecycle states considered "settled" — no more polling needed.
const TERMINAL = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

/**
 * Keeps B2C booking job-status in sync with iTourTT by polling the partner
 * seam (GET /partner/jobs) for open bookings. B2C is the source of truth for
 * bookings; iTourTT is the source of truth for operational job status.
 */
@Injectable()
export class JobSyncService {
  private readonly logger = new Logger(JobSyncService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly partnerClient: PartnerClientService,
  ) {}

  @Cron('0 */2 * * * *') // every 2 minutes
  async pollOpenJobs(): Promise<void> {
    // Bookings that have a job in iTourTT and haven't settled yet.
    const open = await this.prisma.guestBooking.findMany({
      where: {
        partnerJobRef: { not: null },
        OR: [
          { partnerJobStatus: null },
          { partnerJobStatus: { notIn: TERMINAL } },
        ],
      },
      select: { id: true, partnerJobRef: true },
      take: 500,
    });
    if (open.length === 0) return;

    const refs = open.map((b) => b.partnerJobRef!).filter(Boolean);
    let statuses: Array<{ jobRef: string; status: string }>;
    try {
      const res = await this.partnerClient.getJobStatuses(refs);
      statuses = res.jobs ?? [];
    } catch (err) {
      this.logger.warn(`Job-status poll skipped (iTourTT unreachable): ${(err as Error).message}`);
      return;
    }

    const byRef = new Map(statuses.map((s) => [s.jobRef, s.status]));
    let updated = 0;
    for (const b of open) {
      const status = byRef.get(b.partnerJobRef!);
      if (status) {
        await this.prisma.guestBooking.update({
          where: { id: b.id },
          data: { partnerJobStatus: status },
        });
        updated++;
      }
    }
    if (updated) this.logger.log(`Synced ${updated}/${open.length} job status(es) from iTourTT`);
  }

  /** Retry bookings whose partner push previously failed (kept as SYNC_PENDING/FAILED). */
  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryFailedPushes(): Promise<void> {
    const failed = await this.prisma.guestBooking.count({
      where: { partnerSyncStatus: 'FAILED', partnerJobRef: null },
    });
    if (failed > 0) {
      // ponytail: surfaced for now; full re-push reuses the booking→partner mapping
      // (extracted to a shared helper when the admin "retry sync" action lands).
      this.logger.warn(`${failed} booking(s) still not synced to iTourTT — awaiting retry`);
    }
  }
}
