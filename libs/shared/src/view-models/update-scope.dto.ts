import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, ValidateIf } from 'class-validator';

export class UpdateScopeDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty()
  @IsString()
  @ValidateIf((color) => color.startsWith('#') && color.length === 7)
  @IsOptional()
  color?: string;
}
