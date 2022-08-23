import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { UserActivity, UserAvailability } from '@vidvera/core';

export class CreatePresenceSessionDTO {
  @ApiProperty({ enum: UserAvailability, description: 'The base presence information for a user' })
  @IsNotEmpty()
  @IsEnum(UserAvailability)
  availability!: UserAvailability;

  @ApiPropertyOptional({ enum: UserActivity, description: "The supplemental information to a user's availability" })
  @IsOptional()
  @IsEnum(UserActivity)
  activity?: UserActivity;

  @ApiPropertyOptional({ description: 'Optional message with users status' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'How long until the session expires' })
  @IsInt()
  @IsPositive()
  expiresAfterSec!: number;
}
