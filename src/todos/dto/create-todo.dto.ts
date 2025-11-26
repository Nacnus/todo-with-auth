import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTodoDto {
  @ApiProperty({ example: 'Evi Temizle', description: 'Görevin başlığı' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Salon ve mutfak süpürülecek', required: false })
  @IsString()
  @IsOptional()
  description?: string;
}
