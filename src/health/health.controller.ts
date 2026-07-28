import { Controller, Get, Res, VERSION_NEUTRAL, Version } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { HealthService } from './health.service';
import type { ReadinessResponse } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @Version(VERSION_NEUTRAL)
  @ApiOkResponse({ description: 'The process is alive.' })
  live() {
    return this.healthService.live();
  }

  @Get('ready')
  @Version(VERSION_NEUTRAL)
  @ApiOkResponse({ description: 'The service is ready for traffic.' })
  async ready(
    @Res({ passthrough: true }) response: Response,
  ): Promise<ReadinessResponse> {
    const result = await this.healthService.ready();

    if (result.status !== 'ok') {
      response.status(503);
    }

    return result;
  }
}
