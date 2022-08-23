import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsArray, Matches, IsOptional } from 'class-validator';
import { CreateScopeDTO } from './create-scope.dto';

export class CreateTenantDTO {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  displayName!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(/^([\w\-_]+)$/, { message: 'Invalid name, can only contain letters, numbers dashes and underscores' })
  name!: string;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  scopes?: CreateScopeDTO[];
}
