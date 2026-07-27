import { Product } from '../../../catalog/domain/product.entity';
import {
  ProductAutocompleteQuery,
  ProductSearchQuery,
  ProductSearchResults,
} from '../product-search.query';

export const PRODUCT_SEARCH_INDEX = Symbol('PRODUCT_SEARCH_INDEX');

export interface ProductSearchIndex {
  ensureIndex(): Promise<void>;
  indexMany(products: Product[]): Promise<void>;
  deleteOne(productId: string): Promise<void>;
  searchProducts(query: ProductSearchQuery): Promise<ProductSearchResults>;
  autocomplete(query: ProductAutocompleteQuery): Promise<string[]>;
  ping(): Promise<boolean>;
}
