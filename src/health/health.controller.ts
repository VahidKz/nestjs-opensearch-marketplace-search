import { Controller, Get, Res } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { HealthService } from './health.service';
import type { ReadinessResponse } from './health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('live')
  @ApiOkResponse({ description: 'The process is alive.' })
  live() {
    return this.healthService.live();
  }

  @Get('ready')
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
