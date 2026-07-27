import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
} from 'class-validator';
import {
  ProductSearchQuery,
  ProductSearchSort,
} from '../../application/product-search.query';

function toBoolean(value: unknown) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  if (value === true || value === 'true' || value === '1') {
    return true;
  }

  if (value === false || value === 'false' || value === '0') {
    return false;
  }

  return value;
}

export class SearchProductsQueryDto {
  @ApiPropertyOptional({ example: 'tomato basil' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  q?: string;

  @ApiPropertyOptional({ example: 'produce' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiPropertyOptional({ example: 'DE-HH' })
  @IsOptional()
  @IsString()
  deliveryRegion?: string;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({
    enum: ProductSearchSort,
    default: ProductSearchSort.Relevance,
  })
  @IsOptional()
  @IsEnum(ProductSearchSort)
  sort: ProductSearchSort = ProductSearchSort.Relevance;

  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(1_000)
  page = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  toQuery(): ProductSearchQuery {
    return {
      q: this.q,
      category: this.category,
      supplierId: this.supplierId,
      deliveryRegion: this.deliveryRegion,
      minPriceCents:
        typeof this.minPrice === 'number'
          ? Math.round(this.minPrice * 100)
          : undefined,
      maxPriceCents:
        typeof this.maxPrice === 'number'
          ? Math.round(this.maxPrice * 100)
          : undefined,
      inStock: this.inStock,
      sort: this.sort,
      page: this.page,
      limit: this.limit,
    };
  }
}
