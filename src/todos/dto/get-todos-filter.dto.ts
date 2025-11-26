import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTodosFilterDto {
  @ApiPropertyOptional({ description: 'Sayfa numarası (Varsayılan: 1)' })
  @IsOptional()
  @Type(() => Number) // URL'den string gelir, sayıya çevir
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Sayfa başına kayıt (Varsayılan: 10)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Aranacak kelime' })
  @IsOptional()
  @IsString()
  search?: string;
}
