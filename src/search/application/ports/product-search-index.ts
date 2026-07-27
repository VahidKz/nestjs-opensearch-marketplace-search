import { Product } from '../../../catalog/domain/product.entity';

export const PRODUCT_SEARCH_INDEX = Symbol('PRODUCT_SEARCH_INDEX');

export interface ProductSearchIndex {
  ensureIndex(): Promise<void>;
  indexMany(products: Product[]): Promise<void>;
  deleteOne(productId: string): Promise<void>;
  ping(): Promise<boolean>;
}
