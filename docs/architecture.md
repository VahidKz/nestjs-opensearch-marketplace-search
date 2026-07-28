# Architecture Notes

This project is organized around use cases and ports rather than database or framework concerns.

## Boundaries

- `catalog` owns source-of-truth product reads from PostgreSQL.
- `search` owns OpenSearch query/index behavior and queue-backed indexing.
- `infrastructure` holds shared adapters such as Prisma.
- HTTP controllers translate transport concerns into use-case calls and keep business logic out of route handlers.

## Indexing Flow

1. Product IDs are submitted to `SearchIndexQueue`.
2. BullMQ retries failed jobs with exponential backoff.
3. `SearchIndexWorker` loads the current product state through the catalog repository port.
4. `ProductIndexingService` maps products into denormalized search documents.
5. `OpenSearchProductSearchIndex` writes documents through bulk indexing and marks catalog rows as indexed.

## Tradeoffs

- PostgreSQL remains authoritative; OpenSearch is disposable and rebuildable.
- The index mapping is strict to catch accidental document drift early.
- Facets use keyword fields for predictable aggregation performance.
- Relevance is intentionally explainable: text score plus stock, supplier rating, and freshness signals.
