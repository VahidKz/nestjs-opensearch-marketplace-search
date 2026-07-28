import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { CatalogModule } from '../catalog/catalog.module';
import { AutocompleteProductsUseCase } from './application/autocomplete-products.use-case';
import { ProductIndexingService } from './application/product-indexing.service';
import { PRODUCT_SEARCH_INDEX } from './application/ports/product-search-index';
import { SearchProductsUseCase } from './application/search-products.use-case';
import { opensearchClientProvider } from './infrastructure/opensearch/opensearch-client.provider';
import { OpenSearchProductSearchIndex } from './infrastructure/opensearch/opensearch-product-search.index';
import {
  SEARCH_INDEX_QUEUE,
  SearchIndexQueue,
} from './infrastructure/queue/search-index.queue';
import { SearchIndexWorker } from './infrastructure/queue/search-index.worker';
import { redisConnectionFromUrl } from './infrastructure/queue/redis-connection.factory';
import { SearchController } from './interface/http/search.controller';

@Module({
  controllers: [SearchController],
  imports: [
    ConfigModule,
    CatalogModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: redisConnectionFromUrl(
          config.getOrThrow<string>('REDIS_URL'),
        ),
      }),
    }),
    BullModule.registerQueue({
      name: SEARCH_INDEX_QUEUE,
    }),
  ],
  providers: [
    opensearchClientProvider,
    AutocompleteProductsUseCase,
    ProductIndexingService,
    SearchProductsUseCase,
    SearchIndexQueue,
    SearchIndexWorker,
    {
      provide: PRODUCT_SEARCH_INDEX,
      useClass: OpenSearchProductSearchIndex,
    },
  ],
  exports: [PRODUCT_SEARCH_INDEX, ProductIndexingService, SearchIndexQueue],
})
export class SearchModule {}
