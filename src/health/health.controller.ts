import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

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
  async ready() {
    return this.healthService.ready();
  }
}
