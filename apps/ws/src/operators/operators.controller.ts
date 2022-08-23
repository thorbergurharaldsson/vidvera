import { Body, Controller, Delete, Get, Post, Put, Query, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs-snerpa/keycloak';
import { OperatorService } from './operator.service';
import { PaginatedList, ParseOptionalIntPipe } from '@nestjs-snerpa/common';
import { ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { CreateOperatorDTO, UpdateOperatorDTO, ViewOperatorDTO } from '@vidvera/core';

@UseGuards(AuthGuard)
@Controller()
export class OperatorsController {
  constructor(private operatorService: OperatorService) {}

  @ApiOperation({ summary: 'Query operators' })
  @ApiQuery({ name: 'query', required: false, description: 'Query to search by, searches both name fields' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'size', required: false, description: 'Page size' })
  @Get('operators')
  queryOperators(
    @Query('query') query?: string,
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('size', ParseOptionalIntPipe) size?: number
  ): Promise<PaginatedList<ViewOperatorDTO>> {
    return this.operatorService.queryOperators(query, { page, size });
  }

  @ApiOperation({ summary: 'Fetch operator' })
  @ApiParam({ name: 'nameOrId', required: true, description: 'Operator name or id' })
  @Get('operator/:nameOrId')
  fetchOperator(nameOrId: string): Promise<ViewOperatorDTO> {
    return this.operatorService.fetchOperator(nameOrId);
  }

  @ApiOperation({ summary: 'Create operator' })
  @Post('operators')
  createOperator(@Body(new ValidationPipe()) data: CreateOperatorDTO): Promise<ViewOperatorDTO> {
    return this.operatorService.createOperator(data);
  }

  @ApiOperation({ summary: 'Update operator' })
  @ApiParam({ name: 'nameOrId', required: true, description: 'Operator name or id' })
  @Put('operator/:nameOrId')
  updateOperator(nameOrId: string, @Body(new ValidationPipe()) data: UpdateOperatorDTO): Promise<ViewOperatorDTO> {
    return this.operatorService.updateOperator(nameOrId, data);
  }

  @ApiOperation({ summary: 'Delete operator' })
  @ApiParam({ name: 'nameOrId', required: true, description: 'Operator name or id' })
  @Delete('operator/:nameOrId')
  deleteOperator(nameOrId: string): Promise<void> {
    return this.operatorService.deleteOperator(nameOrId);
  }
}
