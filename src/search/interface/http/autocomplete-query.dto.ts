import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsString, Max, Min, MinLength } from 'class-validator';

export class AutocompleteQueryDto {
  @ApiProperty({ example: 'tom' })
  @IsString()
  @MinLength(2)
  q!: string;

  @ApiProperty({ default: 8, minimum: 1, maximum: 20 })
  @Transform(({ value }) => (value === undefined ? 8 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(20)
  limit = 8;
}
