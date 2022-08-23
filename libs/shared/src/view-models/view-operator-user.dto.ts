import { ApiProperty } from '@nestjs/swagger';
import { OperatorRole } from '@vidvera/core';
import { ViewOperatorDTO } from './view-operator.dto';

export class ViewOperatorUserDTO {
  @ApiProperty({ example: 'eb2f5a95-ecc5-4da6-91b4-8e1d9275f4f5', description: 'User id as uuid' })
  id!: string;

  @ApiProperty({ example: 'John Doe', description: 'User name' })
  name?: string;

  @ApiProperty({ example: 'john@asdf.is', description: 'User email' })
  email?: string;

  @ApiProperty({ description: 'Associated operator' })
  operator?: ViewOperatorDTO;

  @ApiProperty({ example: OperatorRole.Admin, description: 'User operator role' })
  role?: OperatorRole;

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Last update date' })
  updatedAt!: Date;
}
