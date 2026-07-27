import { FreshnessGrade, Prisma } from '@prisma/client';
import { moneyFromCents } from '../../domain/money';
import {
  Product,
  ProductFreshnessGrade,
} from '../../domain/product.entity';

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    supplier: true;
  };
}>;

const freshnessGradeMap: Record<FreshnessGrade, ProductFreshnessGrade> = {
  AMBIENT: 'ambient',
  CHILLED: 'chilled',
  FROZEN: 'frozen',
  FRESH: 'fresh',
};

export function toProductEntity(record: ProductWithRelations): Product {
  return {
    id: record.id,
    sku: record.sku,
    name: record.name,
    description: record.description,
    supplier: {
      id: record.supplier.id,
      slug: record.supplier.slug,
      name: record.supplier.name,
      city: record.supplier.city,
      country: record.supplier.country,
      rating: record.supplier.rating?.toNumber() ?? null,
    },
    category: {
      id: record.category.id,
      slug: record.category.slug,
      name: record.category.name,
    },
    price: moneyFromCents(record.priceCents, record.currency),
    priceCents: record.priceCents,
    stockQuantity: record.stockQuantity,
    inStock: record.stockQuantity > 0,
    freshnessGrade: freshnessGradeMap[record.freshnessGrade],
    tags: record.tags,
    allergens: record.allergens,
    deliveryRegions: record.deliveryRegions,
    isActive: record.isActive,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}
