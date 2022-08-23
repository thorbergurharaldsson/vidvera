import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsEnum, IsOptional, IsString, IsInt, IsPositive } from 'class-validator';
import { UserAvailability } from '@vidvera/core';

export class SetUserPresenceDTO {
  @ApiProperty({ enum: UserAvailability, description: 'The base presence information for a user' })
  @IsNotEmpty()
  @IsEnum(UserAvailability)
  availability!: UserAvailability;

  @ApiPropertyOptional({ description: 'Optional message with users status' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiProperty({ description: 'How long until the session expires' })
  @IsInt()
  @IsPositive()
  expiresAfterSec!: number;
}
