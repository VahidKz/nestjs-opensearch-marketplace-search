import { ProductSearchDocument } from '../domain/product-search-document';

export enum ProductSearchSort {
  Relevance = 'relevance',
  PriceAsc = 'price_asc',
  PriceDesc = 'price_desc',
  SupplierRating = 'supplier_rating',
  Newest = 'newest',
}

export interface ProductSearchQuery {
  q?: string;
  category?: string;
  supplierId?: string;
  deliveryRegion?: string;
  minPriceCents?: number;
  maxPriceCents?: number;
  inStock?: boolean;
  sort: ProductSearchSort;
  page: number;
  limit: number;
}

export interface ProductAutocompleteQuery {
  q: string;
  limit: number;
}

export interface SearchFacetBucket {
  value: string;
  count: number;
}

export interface ProductSearchHit {
  score: number;
  product: ProductSearchDocument;
  highlights: Record<string, string[]>;
}

export interface ProductSearchResults {
  total: number;
  page: number;
  limit: number;
  hits: ProductSearchHit[];
  facets: {
    categories: SearchFacetBucket[];
    suppliers: SearchFacetBucket[];
    deliveryRegions: SearchFacetBucket[];
  };
}
