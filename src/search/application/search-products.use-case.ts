import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_SEARCH_INDEX } from './ports/product-search-index';
import type { ProductSearchIndex } from './ports/product-search-index';
import {
  ProductSearchQuery,
  ProductSearchResults,
} from './product-search.query';

@Injectable()
export class SearchProductsUseCase {
  constructor(
    @Inject(PRODUCT_SEARCH_INDEX)
    private readonly productSearchIndex: ProductSearchIndex,
  ) {}

  async execute(query: ProductSearchQuery): Promise<ProductSearchResults> {
    return this.productSearchIndex.searchProducts(query);
  }
}
