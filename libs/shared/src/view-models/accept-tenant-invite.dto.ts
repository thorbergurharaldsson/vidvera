import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class AcceptTenantInviteDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  workPhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isWorkPhonePrivate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  mobilePhone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isMobilePhonePrivate?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  jobTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsEmail()
  email?: string;
}
