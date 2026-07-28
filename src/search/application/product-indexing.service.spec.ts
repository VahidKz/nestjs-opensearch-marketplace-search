import { ProductCatalogRepository } from '../../catalog/application/ports/product-catalog.repository';
import { Product } from '../../catalog/domain/product.entity';
import { ProductSearchIndex } from './ports/product-search-index';
import { ProductIndexingService } from './product-indexing.service';

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
  tags: ['tomato'],
  allergens: [],
  deliveryRegions: ['DE-HH'],
  isActive: true,
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
};

describe('ProductIndexingService', () => {
  let catalogRepository: jest.Mocked<ProductCatalogRepository>;
  let searchIndex: jest.Mocked<ProductSearchIndex>;
  let service: ProductIndexingService;

  beforeEach(() => {
    catalogRepository = {
      findById: jest.fn(),
      findManyForIndex: jest.fn(),
      markIndexed: jest.fn(),
    };
    searchIndex = {
      ensureIndex: jest.fn(),
      indexMany: jest.fn(),
      deleteOne: jest.fn(),
      searchProducts: jest.fn(),
      autocomplete: jest.fn(),
      ping: jest.fn(),
    };
    service = new ProductIndexingService(catalogRepository, searchIndex);
  });

  it('indexes only products that still exist and marks them indexed', async () => {
    catalogRepository.findById
      .mockResolvedValueOnce(product)
      .mockResolvedValueOnce(null);

    await expect(
      service.indexProducts(['product-1', 'deleted-product']),
    ).resolves.toEqual({ indexed: 1 });

    expect(searchIndex.ensureIndex).toHaveBeenCalledTimes(1);
    expect(searchIndex.indexMany).toHaveBeenCalledWith([product]);
    expect(catalogRepository.markIndexed).toHaveBeenCalledWith(
      ['product-1'],
      expect.any(Date),
    );
  });

  it('reindexes the catalog in stable cursor batches', async () => {
    catalogRepository.findManyForIndex
      .mockResolvedValueOnce([product])
      .mockResolvedValueOnce([]);

    await expect(service.reindexAll(1)).resolves.toEqual({ indexed: 1 });

    expect(catalogRepository.findManyForIndex).toHaveBeenNthCalledWith(1, {
      take: 1,
      afterId: undefined,
    });
    expect(catalogRepository.findManyForIndex).toHaveBeenNthCalledWith(2, {
      take: 1,
      afterId: 'product-1',
    });
  });
});
