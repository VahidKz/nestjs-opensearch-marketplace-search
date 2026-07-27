import { Product } from '../../catalog/domain/product.entity';

export interface ProductSearchDocument {
  id: string;
  sku: string;
  name: string;
  description: string;
  supplier: {
    id: string;
    slug: string;
    name: string;
    city: string;
    country: string;
    rating: number | null;
  };
  category: {
    id: string;
    slug: string;
    name: string;
  };
  priceCents: number;
  currency: string;
  stockQuantity: number;
  inStock: boolean;
  freshnessGrade: string;
  tags: string[];
  allergens: string[];
  deliveryRegions: string[];
  rankSignals: {
    supplierRating: number;
    freshnessBoost: number;
    updatedAtEpoch: number;
  };
  indexedAt: string;
}

const freshnessBoosts: Record<Product['freshnessGrade'], number> = {
  fresh: 1.2,
  chilled: 1,
  frozen: 0.85,
  ambient: 0.75,
};

export function toProductSearchDocument(
  product: Product,
): ProductSearchDocument {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    description: product.description,
    supplier: product.supplier,
    category: product.category,
    priceCents: product.priceCents,
    currency: product.price.currency,
    stockQuantity: product.stockQuantity,
    inStock: product.inStock,
    freshnessGrade: product.freshnessGrade,
    tags: product.tags,
    allergens: product.allergens,
    deliveryRegions: product.deliveryRegions,
    rankSignals: {
      supplierRating: product.supplier.rating ?? 0,
      freshnessBoost: freshnessBoosts[product.freshnessGrade],
      updatedAtEpoch: Math.floor(product.updatedAt.getTime() / 1000),
    },
    indexedAt: new Date().toISOString(),
  };
}
