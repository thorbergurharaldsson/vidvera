import { ApiProperty } from '@nestjs/swagger';
import { ViewTenantUserDTO } from './view-tenant-user.dto';

export class ViewUserDTO {
  @ApiProperty({ example: 'eb2f5a95-ecc5-4da6-91b4-8e1d9275f4f5', description: 'User id as uuid' })
  id!: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name?: string;

  @ApiProperty({ example: 'john@asdf.is', description: 'User email' })
  email?: string;

  @ApiProperty({ description: 'Associated tenants' })
  tenants?: ViewTenantUserDTO[];

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Last update date' })
  updatedAt!: Date;
}
