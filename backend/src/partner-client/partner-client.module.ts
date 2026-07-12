import { Global, Module } from '@nestjs/common';
import { PartnerClientService } from './partner-client.service.js';

/** Global so any B2C module (public-api, pricing, poller) can push to iTourTT. */
@Global()
@Module({
  providers: [PartnerClientService],
  exports: [PartnerClientService],
})
export class PartnerClientModule {}
