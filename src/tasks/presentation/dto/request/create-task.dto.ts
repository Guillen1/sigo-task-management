import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional()
  description?: string;
}
