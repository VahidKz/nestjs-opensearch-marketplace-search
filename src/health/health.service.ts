import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../infrastructure/database/prisma.service';
import { PRODUCT_SEARCH_INDEX } from '../search/application/ports/product-search-index';
import type { ProductSearchIndex } from '../search/application/ports/product-search-index';
import { SearchIndexQueue } from '../search/infrastructure/queue/search-index.queue';

type HealthStatus = 'ok' | 'degraded';
type CheckStatus = 'ok' | 'failed';

export interface ReadinessCheck {
  name: string;
  status: CheckStatus;
  latencyMs: number;
  error?: string;
}

export interface ReadinessResponse {
  status: HealthStatus;
  checks: ReadinessCheck[];
  checkedAt: string;
}

@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(PRODUCT_SEARCH_INDEX)
    private readonly productSearchIndex: ProductSearchIndex,
    private readonly searchIndexQueue: SearchIndexQueue,
  ) {}

  live() {
    return {
      status: 'ok' satisfies HealthStatus,
      uptimeSeconds: Math.round(process.uptime()),
      checkedAt: new Date().toISOString(),
    };
  }

  async ready(): Promise<ReadinessResponse> {
    const checks = await Promise.all([
      this.check('postgres', async () => {
        await this.prisma.$queryRaw`SELECT 1`;
      }),
      this.check('opensearch', async () => {
        const healthy = await this.productSearchIndex.ping();

        if (!healthy) {
          throw new Error('OpenSearch ping failed');
        }
      }),
      this.check('redis-queue', async () => {
        const healthy = await this.searchIndexQueue.ping();

        if (!healthy) {
          throw new Error('BullMQ queue ping failed');
        }
      }),
    ]);

    return {
      status: checks.every((check) => check.status === 'ok')
        ? ('ok' satisfies HealthStatus)
        : ('degraded' satisfies HealthStatus),
      checks,
      checkedAt: new Date().toISOString(),
    };
  }

  private async check(
    name: string,
    operation: () => Promise<void>,
  ): Promise<ReadinessCheck> {
    const startedAt = performance.now();

    try {
      await operation();

      return {
        name,
        status: 'ok',
        latencyMs: Math.round(performance.now() - startedAt),
      };
    } catch (error) {
      return {
        name,
        status: 'failed',
        latencyMs: Math.round(performance.now() - startedAt),
        error: (error as Error).message,
      };
    }
  }
}
