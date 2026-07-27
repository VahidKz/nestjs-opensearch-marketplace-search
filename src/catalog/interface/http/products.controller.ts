import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Version,
} from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { GetProductUseCase } from '../../application/use-cases/get-product.use-case';
import { ProductNotFoundError } from '../../domain/product-not-found.error';

@ApiTags('products')
@Controller('products')
export class ProductsController {
  constructor(private readonly getProductUseCase: GetProductUseCase) {}

  @Version('1')
  @Get(':id')
  @ApiOkResponse({ description: 'Return a product from the catalog database.' })
  @ApiNotFoundResponse({ description: 'The product does not exist.' })
  async getById(@Param('id') id: string) {
    try {
      return await this.getProductUseCase.execute(id);
    } catch (error) {
      if (error instanceof ProductNotFoundError) {
        throw new NotFoundException(error.message);
      }

      throw error;
    }
  }
}
