import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateOperatorDTO {
  @ApiProperty()
  @IsOptional()
  @Matches(/^([w\-_]+)$/, { message: 'Invalid name, can only contain letters, numbers dashes and underscores' })
  name?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  displayName?: string;
}
