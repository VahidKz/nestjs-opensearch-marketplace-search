import { Controller, Get, Query, Version } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AutocompleteProductsUseCase } from '../../application/autocomplete-products.use-case';
import { SearchProductsUseCase } from '../../application/search-products.use-case';
import { AutocompleteQueryDto } from './autocomplete-query.dto';
import { SearchProductsQueryDto } from './search-products-query.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(
    private readonly searchProductsUseCase: SearchProductsUseCase,
    private readonly autocompleteProductsUseCase: AutocompleteProductsUseCase,
  ) {}

  @Version('1')
  @Get('products')
  @ApiOkResponse({ description: 'Search products using OpenSearch.' })
  searchProducts(@Query() query: SearchProductsQueryDto) {
    return this.searchProductsUseCase.execute(query.toQuery());
  }

  @Version('1')
  @Get('autocomplete')
  @ApiOkResponse({ description: 'Return product name suggestions.' })
  autocomplete(@Query() query: AutocompleteQueryDto) {
    return this.autocompleteProductsUseCase.execute({
      q: query.q,
      limit: query.limit,
    });
  }
}
