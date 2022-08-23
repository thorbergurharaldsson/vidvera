import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsEmail, IsArray } from 'class-validator';

export class UpdateTenantUserDTO {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  workPhone?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isWorkPhonePrivate?: boolean;

  @ApiProperty()
  @IsString()
  @IsOptional()
  mobilePhone?: string;

  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  isMobilePhonePrivate?: boolean;

  @ApiProperty()
  @IsArray()
  @IsOptional()
  scopes?: number[];

  @ApiProperty()
  @IsString()
  @IsOptional()
  jobTitle?: string;
}
