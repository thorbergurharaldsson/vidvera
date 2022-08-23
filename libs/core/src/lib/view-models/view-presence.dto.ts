import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DateTime } from 'luxon';
import { UserActivity, UserAvailability } from '../models';

export class ViewPresenceDTO {
  @ApiProperty({ enum: UserAvailability, description: 'User availability', example: UserAvailability.Busy })
  availability!: UserAvailability;

  @ApiPropertyOptional({ enum: UserActivity, description: 'User activity', example: UserActivity.InACall })
  activity?: UserActivity;

  @ApiPropertyOptional({ description: 'Optional status message', example: 'On a conference call' })
  message?: string;

  @ApiPropertyOptional({ description: 'Status expiration time as ISO', example: DateTime.local().plus({ hour: 1 }).toISO() })
  expiresAt?: string;
}
