import { Module } from '@nestjs/common';
import { GetProductUseCase } from './application/use-cases/get-product.use-case';
import { PRODUCT_CATALOG_REPOSITORY } from './application/ports/product-catalog.repository';
import { PrismaProductCatalogRepository } from './infrastructure/prisma/prisma-product-catalog.repository';
import { ProductsController } from './interface/http/products.controller';

@Module({
  controllers: [ProductsController],
  providers: [
    GetProductUseCase,
    {
      provide: PRODUCT_CATALOG_REPOSITORY,
      useClass: PrismaProductCatalogRepository,
    },
  ],
  exports: [GetProductUseCase, PRODUCT_CATALOG_REPOSITORY],
})
export class CatalogModule {}
