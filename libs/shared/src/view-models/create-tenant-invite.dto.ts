import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsEmail } from 'class-validator';

export class CreateTenantInviteDTO {
  @ApiProperty({ description: 'Email of the user to invite' })
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
