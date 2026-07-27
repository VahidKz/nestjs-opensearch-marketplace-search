import { Inject, Injectable } from '@nestjs/common';
import { PRODUCT_CATALOG_REPOSITORY } from '../ports/product-catalog.repository';
import type { ProductCatalogRepository } from '../ports/product-catalog.repository';
import { Product } from '../../domain/product.entity';
import { ProductNotFoundError } from '../../domain/product-not-found.error';

@Injectable()
export class GetProductUseCase {
  constructor(
    @Inject(PRODUCT_CATALOG_REPOSITORY)
    private readonly productCatalogRepository: ProductCatalogRepository,
  ) {}

  async execute(productId: string): Promise<Product> {
    const product = await this.productCatalogRepository.findById(productId);

    if (!product) {
      throw new ProductNotFoundError(productId);
    }

    return product;
  }
}
