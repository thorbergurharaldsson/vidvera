import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, ValidateIf } from 'class-validator';

export class CreateScopeDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty()
  @IsString()
  @ValidateIf((color) => color.startsWith('#') && color.length === 7)
  @IsNotEmpty()
  color!: string;
}
