import { Module } from '@nestjs/common';
import { AiVisibilityController } from './ai-visibility.controller.js';
import { AiVisibilityService } from './ai-visibility.service.js';

@Module({
  controllers: [AiVisibilityController],
  providers: [AiVisibilityService],
})
export class AiVisibilityModule {}
