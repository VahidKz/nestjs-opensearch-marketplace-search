import { Inject, Injectable, Logger } from '@nestjs/common';
import { PRODUCT_CATALOG_REPOSITORY } from '../../catalog/application/ports/product-catalog.repository';
import type { ProductCatalogRepository } from '../../catalog/application/ports/product-catalog.repository';
import { PRODUCT_SEARCH_INDEX } from './ports/product-search-index';
import type { ProductSearchIndex } from './ports/product-search-index';

@Injectable()
export class ProductIndexingService {
  private readonly logger = new Logger(ProductIndexingService.name);

  constructor(
    @Inject(PRODUCT_CATALOG_REPOSITORY)
    private readonly catalogRepository: ProductCatalogRepository,
    @Inject(PRODUCT_SEARCH_INDEX)
    private readonly searchIndex: ProductSearchIndex,
  ) {}

  async indexProducts(productIds: string[]) {
    const products = (
      await Promise.all(
        productIds.map((productId) =>
          this.catalogRepository.findById(productId),
        ),
      )
    ).filter((product) => product !== null);

    await this.searchIndex.ensureIndex();
    await this.searchIndex.indexMany(products);
    await this.catalogRepository.markIndexed(
      products.map((product) => product.id),
      new Date(),
    );

    this.logger.log(`Indexed ${products.length} products`);

    return { indexed: products.length };
  }

  async reindexAll(batchSize = 100) {
    await this.searchIndex.ensureIndex();

    let afterId: string | undefined;
    let indexed = 0;

    while (true) {
      const products = await this.catalogRepository.findManyForIndex({
        take: batchSize,
        afterId,
      });

      if (products.length === 0) {
        break;
      }

      await this.searchIndex.indexMany(products);
      await this.catalogRepository.markIndexed(
        products.map((product) => product.id),
        new Date(),
      );

      indexed += products.length;
      afterId = products.at(-1)?.id;
      this.logger.log(`Indexed ${indexed} products so far`);
    }

    return { indexed };
  }
}
