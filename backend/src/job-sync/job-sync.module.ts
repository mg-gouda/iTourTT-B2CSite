import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module.js';
import { JobSyncService } from './job-sync.service.js';

@Module({
  imports: [PrismaModule],
  providers: [JobSyncService],
})
export class JobSyncModule {}
