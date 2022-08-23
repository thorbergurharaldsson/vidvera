import { ApiProperty } from '@nestjs/swagger';
import { ViewPresenceDTO, ViewScopeDTO, ViewTenantDTO } from './';

export class ViewTenantUserDTO {
  @ApiProperty({ example: 'eb2f5a95-ecc5-4da6-91b4-8e1d9275f4f5', description: 'User id as uuid' })
  id!: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name?: string;

  @ApiProperty({ example: 'john@asdf.is', description: 'User email' })
  email?: string;

  @ApiProperty({ example: '+354 123 45 67', description: 'User work phone number' })
  workPhone?: string;

  @ApiProperty({ example: false, description: 'Work phone number is private' })
  isWorkPhonePrivate?: boolean;

  @ApiProperty({ example: '+354 123 45 67', description: 'User mobile phone number' })
  mobilePhone?: string;

  @ApiProperty({ example: true, description: 'Mobile phone number is private' })
  isMobilePhonePrivate?: boolean;

  @ApiProperty({ example: ['Sales'], description: 'User tenant scopes' })
  scopes?: ViewScopeDTO[];

  @ApiProperty({ description: 'Associated tenant' })
  tenant?: ViewTenantDTO;

  @ApiProperty({ example: 'Engineer', description: 'Job title' })
  jobTitle?: string;

  @ApiProperty({ example: 'online', description: 'User presence', type: ViewPresenceDTO })
  presence!: ViewPresenceDTO;

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Last update date' })
  updatedAt!: Date;
}
