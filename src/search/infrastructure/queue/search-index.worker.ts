import { Logger } from '@nestjs/common';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ProductIndexingService } from '../../application/product-indexing.service';
import {
  IndexProductsJob,
  ReindexProductsJob,
  SearchIndexJob,
  SEARCH_INDEX_QUEUE,
} from './search-index.queue';

@Processor(SEARCH_INDEX_QUEUE, { concurrency: 3 })
export class SearchIndexWorker extends WorkerHost {
  private readonly logger = new Logger(SearchIndexWorker.name);

  constructor(private readonly productIndexingService: ProductIndexingService) {
    super();
  }

  async process(job: Job<SearchIndexJob>) {
    this.logger.log(`Processing ${job.name} job ${job.id}`);

    if (job.name === 'index-products') {
      const data = job.data as IndexProductsJob;
      return this.productIndexingService.indexProducts(data.productIds);
    }

    const data = job.data as ReindexProductsJob;
    return this.productIndexingService.reindexAll(data.batchSize);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Completed search index job ${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error) {
    this.logger.error(
      `Search index job ${job?.id ?? 'unknown'} failed: ${error.message}`,
      error.stack,
    );
  }
}
