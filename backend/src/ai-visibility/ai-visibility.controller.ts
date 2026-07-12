import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AiVisibilityService } from './ai-visibility.service.js';
import { CheckVisibilityDto } from './dto/check-visibility.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';

@Controller('ai-visibility')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Roles('ADMIN')
@Permissions('users')
export class AiVisibilityController {
  constructor(private readonly service: AiVisibilityService) {}

  // Which engines are wired up (API keys present) — for the setup hints UI.
  @Get('status')
  status() {
    return this.service.getStatus();
  }

  // Run the selected (or all) answer engines for one query.
  @Post('check')
  async check(@Body() dto: CheckVisibilityDto) {
    const results = await this.service.check(dto.query, dto.engines);
    return { query: dto.query, results };
  }
}
