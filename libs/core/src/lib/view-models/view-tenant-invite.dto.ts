import { ApiProperty } from '@nestjs/swagger';
export class ViewTenantInviteDTO {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  acceptedAt?: Date;

  @ApiProperty()
  inviteSentAt?: Date;

  @ApiProperty()
  expiresAt!: Date;

  @ApiProperty()
  createdAt!: Date;
}
