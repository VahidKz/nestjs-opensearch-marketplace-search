import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

export const SEARCH_INDEX_QUEUE = 'search-index';

export type SearchIndexJobName = 'index-products' | 'reindex-products';

export interface IndexProductsJob {
  productIds: string[];
  reason: string;
}

export interface ReindexProductsJob {
  batchSize: number;
  reason: string;
}

export type SearchIndexJob = IndexProductsJob | ReindexProductsJob;

@Injectable()
export class SearchIndexQueue {
  constructor(
    @InjectQueue(SEARCH_INDEX_QUEUE)
    private readonly queue: Queue<SearchIndexJob, void, SearchIndexJobName>,
  ) {}

  async enqueueProducts(productIds: string[], reason: string) {
    if (productIds.length === 0) {
      return null;
    }

    return this.queue.add(
      'index-products',
      { productIds, reason },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1_000 },
        removeOnComplete: { age: 86_400, count: 1_000 },
        removeOnFail: { age: 604_800, count: 5_000 },
      },
    );
  }

  async enqueueReindex(batchSize = 100) {
    return this.queue.add(
      'reindex-products',
      { batchSize, reason: 'manual-reindex' },
      {
        attempts: 3,
        backoff: { type: 'exponential', delay: 5_000 },
        removeOnComplete: { age: 86_400, count: 100 },
        removeOnFail: { age: 604_800, count: 500 },
      },
    );
  }

  async ping(): Promise<boolean> {
    try {
      await this.queue.getJobCounts('waiting', 'active', 'delayed', 'failed');
      return true;
    } catch {
      return false;
    }
  }
}
