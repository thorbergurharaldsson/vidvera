import { ApiProperty } from '@nestjs/swagger';
import { ViewTenantDTO } from './';
import { ViewOperatorDTO } from './view-operator.dto';

export class ViewOperatorTenantDTO {
  @ApiProperty({ description: 'Associated tenant' })
  tenant!: ViewTenantDTO;

  @ApiProperty({ description: 'Associated operator' })
  operator!: ViewOperatorDTO;

  @ApiProperty({ description: 'Status of the association' })
  status!: any;

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Creation date' })
  createdAt!: Date;

  @ApiProperty({ example: '2022-05-30T13:03:09.000Z', description: 'Last update date' })
  updatedAt!: Date;
}
