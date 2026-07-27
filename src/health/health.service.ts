import { Injectable } from '@nestjs/common';

type HealthStatus = 'ok' | 'degraded';

@Injectable()
export class HealthService {
  live() {
    return {
      status: 'ok' satisfies HealthStatus,
      uptimeSeconds: Math.round(process.uptime()),
      checkedAt: new Date().toISOString(),
    };
  }

  async ready() {
    return {
      status: 'ok' satisfies HealthStatus,
      checks: [
        {
          name: 'api',
          status: 'ok',
        },
      ],
      checkedAt: new Date().toISOString(),
    };
  }
}
