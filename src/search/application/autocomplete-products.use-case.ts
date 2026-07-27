import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_SEARCH_INDEX } from './ports/product-search-index';
import type { ProductSearchIndex } from './ports/product-search-index';
import { ProductAutocompleteQuery } from './product-search.query';

@Injectable()
export class AutocompleteProductsUseCase {
  constructor(
    @Inject(PRODUCT_SEARCH_INDEX)
    private readonly productSearchIndex: ProductSearchIndex,
  ) {}

  async execute(query: ProductAutocompleteQuery): Promise<string[]> {
    return this.productSearchIndex.autocomplete(query);
  }
}
