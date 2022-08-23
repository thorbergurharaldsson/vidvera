import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateTenantDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  name!: string;

  @ApiProperty()
  @IsUUID()
  @IsOptional()
  accountId!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  keycloakRealmName!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  keycloakClientId!: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  keycloakClientSecret!: string;
}
