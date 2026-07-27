export const PRODUCT_INDEX_VERSION = 'v1';

export const productIndexDefinition = {
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    analysis: {
      analyzer: {
        product_text: {
          type: 'custom',
          tokenizer: 'standard',
          filter: ['lowercase', 'asciifolding', 'porter_stem'],
        },
        autocomplete: {
          type: 'custom',
          tokenizer: 'autocomplete_tokenizer',
          filter: ['lowercase', 'asciifolding'],
        },
      },
      tokenizer: {
        autocomplete_tokenizer: {
          type: 'edge_ngram',
          min_gram: 2,
          max_gram: 20,
          token_chars: ['letter', 'digit'],
        },
      },
      normalizer: {
        keyword_lowercase: {
          type: 'custom',
          filter: ['lowercase', 'asciifolding'],
        },
      },
    },
  },
  mappings: {
    dynamic: 'strict',
    properties: {
      id: { type: 'keyword' },
      sku: { type: 'keyword' },
      name: {
        type: 'text',
        analyzer: 'product_text',
        fields: {
          keyword: { type: 'keyword', normalizer: 'keyword_lowercase' },
          suggest: {
            type: 'text',
            analyzer: 'autocomplete',
            search_analyzer: 'standard',
          },
        },
      },
      description: { type: 'text', analyzer: 'product_text' },
      supplier: {
        properties: {
          id: { type: 'keyword' },
          slug: { type: 'keyword' },
          name: {
            type: 'text',
            analyzer: 'product_text',
            fields: {
              keyword: { type: 'keyword', normalizer: 'keyword_lowercase' },
            },
          },
          city: { type: 'keyword' },
          country: { type: 'keyword' },
          rating: { type: 'float' },
        },
      },
      category: {
        properties: {
          id: { type: 'keyword' },
          slug: { type: 'keyword' },
          name: { type: 'keyword', normalizer: 'keyword_lowercase' },
        },
      },
      priceCents: { type: 'integer' },
      currency: { type: 'keyword' },
      stockQuantity: { type: 'integer' },
      inStock: { type: 'boolean' },
      freshnessGrade: { type: 'keyword' },
      tags: { type: 'keyword', normalizer: 'keyword_lowercase' },
      allergens: { type: 'keyword', normalizer: 'keyword_lowercase' },
      deliveryRegions: { type: 'keyword' },
      rankSignals: {
        properties: {
          supplierRating: { type: 'float' },
          freshnessBoost: { type: 'float' },
          updatedAtEpoch: { type: 'long' },
        },
      },
      indexedAt: { type: 'date' },
    },
  },
};
