import { ApiProperty } from '@nestjs/swagger';
import { ViewUserDTO } from './view-user.dto';

export class ViewScopeDTO {
  @ApiProperty({ example: '1', description: 'Scope id' })
  id!: number;

  @ApiProperty({ example: 'Sales', description: 'Scope name' })
  name!: string;

  @ApiProperty({ example: '#00ff00', description: 'Scope color' })
  color!: string;

  @ApiProperty()
  users?: ViewUserDTO[];

  @ApiProperty({ example: '2020-05-30T13:03:09.000Z', description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ example: '2020-05-30T13:03:09.000Z', description: 'Last update date' })
  updatedAt!: Date;
}
