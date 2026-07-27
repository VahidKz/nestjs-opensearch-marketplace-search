import { Product } from '../../domain/product.entity';

export const PRODUCT_CATALOG_REPOSITORY = Symbol('PRODUCT_CATALOG_REPOSITORY');

export interface ProductCatalogRepository {
  findById(id: string): Promise<Product | null>;
  findManyForIndex(options: {
    take: number;
    afterId?: string;
  }): Promise<Product[]>;
  markIndexed(productIds: string[], indexedAt: Date): Promise<void>;
}
