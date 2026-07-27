import {
  ProductSearchQuery,
  ProductSearchSort,
} from './product-search.query';

export function buildProductSearchRequest(query: ProductSearchQuery) {
  const filter: Record<string, unknown>[] = [{ term: { isActive: true } }];

  if (query.category) {
    filter.push({ term: { 'category.slug': query.category } });
  }

  if (query.supplierId) {
    filter.push({ term: { 'supplier.id': query.supplierId } });
  }

  if (query.deliveryRegion) {
    filter.push({ term: { deliveryRegions: query.deliveryRegion } });
  }

  if (typeof query.inStock === 'boolean') {
    filter.push({ term: { inStock: query.inStock } });
  }

  if (
    typeof query.minPriceCents === 'number' ||
    typeof query.maxPriceCents === 'number'
  ) {
    filter.push({
      range: {
        priceCents: {
          ...(typeof query.minPriceCents === 'number'
            ? { gte: query.minPriceCents }
            : {}),
          ...(typeof query.maxPriceCents === 'number'
            ? { lte: query.maxPriceCents }
            : {}),
        },
      },
    });
  }

  const must = query.q
    ? [
        {
          multi_match: {
            query: query.q,
            type: 'best_fields',
            operator: 'and',
            fuzziness: 'AUTO',
            fields: [
              'name^5',
              'name.suggest^2',
              'description',
              'supplier.name^2',
              'category.name^2',
              'tags^3',
              'sku^4',
            ],
          },
        },
      ]
    : [{ match_all: {} }];

  return {
    from: (query.page - 1) * query.limit,
    size: query.limit,
    track_total_hits: true,
    query: {
      function_score: {
        query: {
          bool: {
            must,
            filter,
          },
        },
        functions: [
          {
            filter: { term: { inStock: true } },
            weight: 1.2,
          },
          {
            field_value_factor: {
              field: 'rankSignals.supplierRating',
              factor: 0.08,
              missing: 0,
            },
          },
          {
            field_value_factor: {
              field: 'rankSignals.freshnessBoost',
              factor: 1,
              missing: 1,
            },
          },
        ],
        score_mode: 'sum',
        boost_mode: 'sum',
      },
    },
    sort: buildSort(query.sort),
    aggs: {
      categories: { terms: { field: 'category.slug', size: 20 } },
      suppliers: { terms: { field: 'supplier.id', size: 20 } },
      deliveryRegions: { terms: { field: 'deliveryRegions', size: 30 } },
    },
    highlight: {
      fields: {
        name: {},
        description: {},
      },
    },
  };
}

export function buildAutocompleteRequest(q: string, limit: number) {
  return {
    size: limit,
    _source: ['name'],
    query: {
      bool: {
        filter: [{ term: { isActive: true } }],
        should: [
          { match_phrase_prefix: { 'name.suggest': q } },
          { match_phrase_prefix: { name: q } },
        ],
        minimum_should_match: 1,
      },
    },
    collapse: {
      field: 'name.keyword',
    },
  };
}

function buildSort(sort: ProductSearchSort) {
  switch (sort) {
    case ProductSearchSort.PriceAsc:
      return [{ priceCents: 'asc' }, { _score: 'desc' }];
    case ProductSearchSort.PriceDesc:
      return [{ priceCents: 'desc' }, { _score: 'desc' }];
    case ProductSearchSort.SupplierRating:
      return [{ 'rankSignals.supplierRating': 'desc' }, { _score: 'desc' }];
    case ProductSearchSort.Newest:
      return [{ 'rankSignals.updatedAtEpoch': 'desc' }, { _score: 'desc' }];
    case ProductSearchSort.Relevance:
    default:
      return [{ _score: 'desc' }, { 'rankSignals.supplierRating': 'desc' }];
  }
}
