import { ApiProperty } from '@nestjs/swagger';

export class ViewTenantDTO {
  @ApiProperty({ example: 'eb2f5a95-ecc5-4da6-91b4-8e1d9275f4f5', description: 'Tenant id as uuid' })
  id!: string;

  @ApiProperty({ example: 'Snerpa ehf', description: 'Tenant display name' })
  displayName!: string;

  @ApiProperty({ example: 'snerpa', description: 'Tenant name' })
  name!: string;

  @ApiProperty()
  scopes?: any[]; // ViewScopeDTO[];

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Last update date' })
  updatedAt!: Date;
}
