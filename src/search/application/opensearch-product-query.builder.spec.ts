import {
  buildAutocompleteRequest,
  buildProductSearchRequest,
} from './opensearch-product-query.builder';
import { ProductSearchSort } from './product-search.query';

describe('buildProductSearchRequest', () => {
  it('builds a relevance search with filters, scoring signals, facets, and pagination', () => {
    const request = buildProductSearchRequest({
      q: 'tomato basil',
      category: 'produce',
      supplierId: 'supplier-1',
      deliveryRegion: 'DE-HH',
      minPriceCents: 1_000,
      maxPriceCents: 5_000,
      inStock: true,
      sort: ProductSearchSort.Relevance,
      page: 2,
      limit: 10,
    });

    expect(request.from).toBe(10);
    expect(request.size).toBe(10);
    expect(JSON.stringify(request.query)).toContain('tomato basil');
    expect(JSON.stringify(request.query)).toContain('category.slug');
    expect(JSON.stringify(request.query)).toContain('supplier.id');
    expect(JSON.stringify(request.query)).toContain('deliveryRegions');
    expect(JSON.stringify(request.query)).toContain('priceCents');
    expect(request.aggs).toHaveProperty('categories');
    expect(request.sort).toEqual([
      { _score: 'desc' },
      { 'rankSignals.supplierRating': 'desc' },
    ]);
  });

  it('uses deterministic sort clauses for non-relevance sorting', () => {
    const request = buildProductSearchRequest({
      sort: ProductSearchSort.PriceAsc,
      page: 1,
      limit: 20,
    });

    expect(request.sort).toEqual([{ priceCents: 'asc' }, { _score: 'desc' }]);
  });
});

describe('buildAutocompleteRequest', () => {
  it('builds an active-product autocomplete query', () => {
    const request = buildAutocompleteRequest('tom', 8);

    expect(request.size).toBe(8);
    expect(JSON.stringify(request.query)).toContain('name.suggest');
    expect(JSON.stringify(request.query)).toContain('isActive');
    expect(request.collapse).toEqual({ field: 'name.keyword' });
  });
});
