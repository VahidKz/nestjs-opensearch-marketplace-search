import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProductCatalogRepository } from '../../application/ports/product-catalog.repository';
import { Product } from '../../domain/product.entity';
import { PrismaService } from '../../../infrastructure/database/prisma.service';
import { toProductEntity } from './prisma-product.mapper';

const productInclude = {
  category: true,
  supplier: true,
} satisfies Prisma.ProductInclude;

@Injectable()
export class PrismaProductCatalogRepository implements ProductCatalogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Product | null> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: productInclude,
    });

    return product ? toProductEntity(product) : null;
  }

  async findManyForIndex(options: {
    take: number;
    afterId?: string;
  }): Promise<Product[]> {
    const products = await this.prisma.product.findMany({
      take: options.take,
      skip: options.afterId ? 1 : 0,
      cursor: options.afterId ? { id: options.afterId } : undefined,
      orderBy: { id: 'asc' },
      include: productInclude,
    });

    return products.map(toProductEntity);
  }

  async markIndexed(productIds: string[], indexedAt: Date): Promise<void> {
    if (productIds.length === 0) {
      return;
    }

    await this.prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { indexedAt },
    });
  }
}
