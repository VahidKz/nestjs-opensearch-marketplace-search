import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { Product } from '../../../catalog/domain/product.entity';
import { ProductSearchIndex } from '../../application/ports/product-search-index';
import {
  ProductAutocompleteQuery,
  ProductSearchQuery,
  ProductSearchResults,
  SearchFacetBucket,
} from '../../application/product-search.query';
import {
  buildAutocompleteRequest,
  buildProductSearchRequest,
} from '../../application/opensearch-product-query.builder';
import {
  ProductSearchDocument,
  toProductSearchDocument,
} from '../../domain/product-search-document';
import { OPENSEARCH_CLIENT } from './opensearch-client.provider';
import {
  PRODUCT_INDEX_VERSION,
  productIndexDefinition,
} from './product-index.definition';

interface BulkResponseBody {
  errors: boolean;
  items: Array<Record<string, { error?: unknown }>>;
}

interface SearchResponseBody {
  hits: {
    total: number | { value: number };
    hits: Array<{
      _score?: number;
      _source: ProductSearchDocument;
      highlight?: Record<string, string[]>;
    }>;
  };
  aggregations?: Record<
    string,
    { buckets?: Array<{ key: string; doc_count: number }> }
  >;
}

@Injectable()
export class OpenSearchProductSearchIndex implements ProductSearchIndex {
  private readonly logger = new Logger(OpenSearchProductSearchIndex.name);
  private readonly aliasName: string;
  private readonly concreteIndexName: string;

  constructor(
    @Inject(OPENSEARCH_CLIENT) private readonly client: Client,
    config: ConfigService,
  ) {
    this.aliasName = config.getOrThrow<string>('SEARCH_INDEX_ALIAS');
    this.concreteIndexName = `${this.aliasName}-${PRODUCT_INDEX_VERSION}`;
  }

  async ensureIndex(): Promise<void> {
    await this.createConcreteIndexIfMissing();
    await this.createAliasIfMissing();
  }

  async indexMany(products: Product[]): Promise<void> {
    if (products.length === 0) {
      return;
    }

    const body = products.flatMap((product) => [
      { index: { _index: this.aliasName, _id: product.id } },
      toProductSearchDocument(product),
    ]);

    const response: unknown = await this.client.bulk({ refresh: false, body });
    const payload = response as {
      body?: BulkResponseBody;
    } & BulkResponseBody;
    const bodyPayload = payload.body ?? payload;

    if (bodyPayload.errors) {
      const errors = bodyPayload.items
        .flatMap((item) => Object.values(item))
        .filter((item) => item.error)
        .map((item) => item.error);

      throw new Error(
        `OpenSearch bulk index failed: ${JSON.stringify(errors)}`,
      );
    }
  }

  async deleteOne(productId: string): Promise<void> {
    await this.client.delete(
      {
        index: this.aliasName,
        id: productId,
      },
      { ignore: [404] },
    );
  }

  async searchProducts(
    query: ProductSearchQuery,
  ): Promise<ProductSearchResults> {
    const response: unknown = await this.client.search({
      index: this.aliasName,
      body: buildProductSearchRequest(query) as never,
    });
    const payload = this.extractSearchPayload(response);

    return {
      total: this.extractTotal(payload.hits.total),
      page: query.page,
      limit: query.limit,
      hits: payload.hits.hits.map((hit) => ({
        score: hit._score ?? 0,
        product: hit._source,
        highlights: hit.highlight ?? {},
      })),
      facets: {
        categories: this.toFacetBuckets(payload, 'categories'),
        suppliers: this.toFacetBuckets(payload, 'suppliers'),
        deliveryRegions: this.toFacetBuckets(payload, 'deliveryRegions'),
      },
    };
  }

  async autocomplete(query: ProductAutocompleteQuery): Promise<string[]> {
    const response: unknown = await this.client.search({
      index: this.aliasName,
      body: buildAutocompleteRequest(query.q, query.limit) as never,
    });
    const payload = this.extractSearchPayload(response);
    const suggestions = payload.hits.hits.map((hit) => hit._source.name);

    return [...new Set(suggestions)].slice(0, query.limit);
  }

  async ping(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      this.logger.warn(`OpenSearch ping failed: ${(error as Error).message}`);
      return false;
    }
  }

  private async createConcreteIndexIfMissing() {
    try {
      await this.client.indices.create({
        index: this.concreteIndexName,
        body: productIndexDefinition as never,
      });
    } catch (error) {
      if (!this.isAlreadyExistsError(error)) {
        throw error;
      }
    }
  }

  private async createAliasIfMissing() {
    try {
      await this.client.indices.putAlias({
        index: this.concreteIndexName,
        name: this.aliasName,
      });
    } catch (error) {
      if (!this.isAlreadyExistsError(error)) {
        throw error;
      }
    }
  }

  private isAlreadyExistsError(error: unknown) {
    const responseBody = (error as { body?: { error?: { type?: string } } })
      .body;
    const errorType = responseBody?.error?.type;

    return (
      errorType === 'resource_already_exists_exception' ||
      errorType === 'invalid_alias_name_exception'
    );
  }

  private extractSearchPayload(response: unknown): SearchResponseBody {
    const payload = response as {
      body?: SearchResponseBody;
    } & SearchResponseBody;

    return payload.body ?? payload;
  }

  private extractTotal(total: number | { value: number }) {
    return typeof total === 'number' ? total : total.value;
  }

  private toFacetBuckets(
    payload: SearchResponseBody,
    aggregationName: string,
  ): SearchFacetBucket[] {
    const buckets = payload.aggregations?.[aggregationName]?.buckets ?? [];

    return buckets.map((bucket) => ({
      value: bucket.key,
      count: bucket.doc_count,
    }));
  }
}
