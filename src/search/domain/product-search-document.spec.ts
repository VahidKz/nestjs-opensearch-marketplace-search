import { Product } from '../../catalog/domain/product.entity';
import { toProductSearchDocument } from './product-search-document';

describe('toProductSearchDocument', () => {
  it('maps catalog products into denormalized search documents', () => {
    const product: Product = {
      id: 'product-1',
      sku: 'NF-TOM-5KG',
      name: 'Vine tomatoes',
      description: 'Restaurant crate of tomatoes.',
      supplier: {
        id: 'supplier-1',
        slug: 'nordic-farms',
        name: 'Nordic Farms Cooperative',
        city: 'Hamburg',
        country: 'DE',
        rating: 4.8,
      },
      category: {
        id: 'category-1',
        slug: 'produce',
        name: 'Fresh produce',
      },
      price: {
        amount: 18.9,
        currency: 'EUR',
      },
      priceCents: 1_890,
      stockQuantity: 42,
      inStock: true,
      freshnessGrade: 'fresh',
      tags: ['tomato', 'local'],
      allergens: [],
      deliveryRegions: ['DE-HH'],
      isActive: true,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    };

    const document = toProductSearchDocument(product);

    expect(document.id).toBe(product.id);
    expect(document.supplier.name).toBe('Nordic Farms Cooperative');
    expect(document.category.slug).toBe('produce');
    expect(document.isActive).toBe(true);
    expect(document.rankSignals.supplierRating).toBe(4.8);
    expect(document.rankSignals.freshnessBoost).toBeGreaterThan(1);
    expect(document.rankSignals.updatedAtEpoch).toBe(1_767_312_000);
  });
});
