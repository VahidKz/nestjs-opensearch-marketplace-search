import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import type { App } from 'supertest/types';
import { HealthController } from '../src/health/health.controller';
import { HealthService } from '../src/health/health.service';
import { ProductsController } from '../src/catalog/interface/http/products.controller';
import { GetProductUseCase } from '../src/catalog/application/use-cases/get-product.use-case';
import { ProductNotFoundError } from '../src/catalog/domain/product-not-found.error';
import { SearchController } from '../src/search/interface/http/search.controller';
import { SearchProductsUseCase } from '../src/search/application/search-products.use-case';
import { AutocompleteProductsUseCase } from '../src/search/application/autocomplete-products.use-case';

describe('Marketplace API (e2e)', () => {
  let app: INestApplication<App>;
  let healthService: jest.Mocked<HealthService>;
  let getProductUseCase: jest.Mocked<GetProductUseCase>;
  let searchProductsUseCase: jest.Mocked<SearchProductsUseCase>;
  let autocompleteProductsUseCase: jest.Mocked<AutocompleteProductsUseCase>;

  beforeEach(async () => {
    healthService = {
      live: jest.fn().mockReturnValue({
        status: 'ok',
        uptimeSeconds: 1,
        checkedAt: '2026-01-01T00:00:00.000Z',
      }),
      ready: jest.fn().mockResolvedValue({
        status: 'ok',
        checks: [{ name: 'postgres', status: 'ok', latencyMs: 1 }],
        checkedAt: '2026-01-01T00:00:00.000Z',
      }),
    } as unknown as jest.Mocked<HealthService>;
    getProductUseCase = {
      execute: jest.fn().mockResolvedValue({
        id: 'product-1',
        sku: 'NF-TOM-5KG',
        name: 'Vine tomatoes',
      }),
    } as unknown as jest.Mocked<GetProductUseCase>;
    searchProductsUseCase = {
      execute: jest.fn().mockResolvedValue({
        total: 0,
        page: 1,
        limit: 20,
        hits: [],
        facets: { categories: [], suppliers: [], deliveryRegions: [] },
      }),
    } as unknown as jest.Mocked<SearchProductsUseCase>;
    autocompleteProductsUseCase = {
      execute: jest.fn().mockResolvedValue(['Vine tomatoes']),
    } as unknown as jest.Mocked<AutocompleteProductsUseCase>;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [HealthController, ProductsController, SearchController],
      providers: [
        { provide: HealthService, useValue: healthService },
        { provide: GetProductUseCase, useValue: getProductUseCase },
        { provide: SearchProductsUseCase, useValue: searchProductsUseCase },
        {
          provide: AutocompleteProductsUseCase,
          useValue: autocompleteProductsUseCase,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    await app.init();
  });

  it('returns liveness', () => {
    return request(app.getHttpServer())
      .get('/health/live')
      .expect(200)
      .expect(({ body }) => {
        expect((body as { status: string }).status).toBe('ok');
      });
  });

  it('returns readiness with a 503 when dependencies are degraded', () => {
    healthService.ready.mockResolvedValueOnce({
      status: 'degraded',
      checks: [{ name: 'opensearch', status: 'failed', latencyMs: 5 }],
      checkedAt: '2026-01-01T00:00:00.000Z',
    });

    return request(app.getHttpServer()).get('/health/ready').expect(503);
  });

  it('returns product details', () => {
    return request(app.getHttpServer())
      .get('/v1/products/product-1')
      .expect(200)
      .expect(({ body }) => {
        expect((body as { sku: string }).sku).toBe('NF-TOM-5KG');
      });
  });

  it('translates missing products to 404', () => {
    getProductUseCase.execute.mockRejectedValueOnce(
      new ProductNotFoundError('missing'),
    );

    return request(app.getHttpServer()).get('/v1/products/missing').expect(404);
  });

  it('validates and executes product search', () => {
    return request(app.getHttpServer())
      .get('/v1/search/products')
      .query({
        q: 'tomato',
        category: 'produce',
        inStock: 'true',
        page: '1',
        limit: '5',
      })
      .expect(200)
      .expect(() => {
        expect(searchProductsUseCase.execute.mock.calls[0]?.[0]).toEqual(
          expect.objectContaining({
            q: 'tomato',
            category: 'produce',
            inStock: true,
            page: 1,
            limit: 5,
          }),
        );
      });
  });

  it('rejects invalid search pagination', () => {
    return request(app.getHttpServer())
      .get('/v1/search/products')
      .query({ limit: '101' })
      .expect(400);
  });

  it('returns autocomplete suggestions', () => {
    return request(app.getHttpServer())
      .get('/v1/search/autocomplete')
      .query({ q: 'tom' })
      .expect(200)
      .expect(({ body }) => {
        expect(body).toEqual(['Vine tomatoes']);
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
