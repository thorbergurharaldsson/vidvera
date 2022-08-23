import { PaginatedList, ParseOptionalIntPipe } from '@nestjs-snerpa/common';
import { AuthGuard, RoleGuard } from '@nestjs-snerpa/keycloak';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UseGuards,
  ValidationPipe
} from '@nestjs/common';
import { ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  AcceptTenantInviteDTO,
  AppRole,
  CreateScopeDTO,
  CreateTenantDTO,
  CreateTenantInviteDTO,
  SetUserPresenceDTO,
  UpdateScopeDTO,
  UpdateTenantDTO,
  UpdateTenantUserDTO,
  ViewOperatorTenantDTO,
  ViewPresenceDTO,
  ViewScopeDTO,
  ViewTenantDTO,
  ViewTenantInviteDTO,
  ViewTenantUserDTO
} from '@vidvera/core';

import { ScopesService } from '../scopes/scopes.service';
import { TenantUsersService } from '../users/tenant-users.service';
import { TenantsService } from './tenants.service';

@ApiTags('Tenants')
@Controller()
@UseGuards(AuthGuard)
export class TenantsController {
  constructor(
    private readonly tenantService: TenantsService,
    private userService: TenantUsersService,
    private scopeService: ScopesService
  ) {}

  @ApiOperation({ summary: 'Create a new tenant' })
  @ApiBody({ type: CreateTenantDTO })
  @ApiOkResponse({ type: ViewTenantDTO })
  @Post('tenants')
  async createTenant(@Body(new ValidationPipe()) tenant: CreateTenantDTO): Promise<ViewTenantDTO> {
    return this.tenantService.createTenant(tenant);
  }

  @ApiOperation({ summary: 'Fetch all tenants' })
  @ApiQuery({ name: 'page', example: 0, description: 'Page number', required: false })
  @ApiQuery({ name: 'size', example: 25, description: 'Page size', required: false })
  @ApiQuery({ name: 'name', example: 'snerpa', description: 'Tenant name', required: false })
  @UseGuards(RoleGuard(AppRole.Superuser))
  @Get('tenants')
  async fetchTenants(
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('size', ParseOptionalIntPipe) size?: number,
    @Query('name') name?: string
  ) {
    return this.tenantService.fetchTenants({ name }, { page, size });
  }

  @ApiOperation({ summary: 'Fetch a tenant by id' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiOkResponse({ type: ViewTenantDTO })
  @ApiNotFoundResponse({ description: 'Tenant not found' })
  @Get('tenant/:tenantId')
  async fetchTenant(@Param('tenantId') id: string): Promise<ViewTenantDTO> {
    return this.tenantService.fetchTenant(id);
  }

  @ApiOperation({ summary: 'Update a tenant' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiOkResponse({ type: ViewTenantDTO })
  @Put('tenant/:tenantId')
  async updateTenant(@Param('tenantId') id: string, @Body(new ValidationPipe()) tenant: UpdateTenantDTO): Promise<ViewTenantDTO> {
    return this.tenantService.updateTenant(id, tenant);
  }

  @ApiOperation({ summary: 'Delete a tenant' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('tenant/:tenantId')
  async deleteTenant(@Param('tenantId') id: string) {
    this.tenantService.deleteTenant(id);
  }

  @ApiOperation({ summary: 'Fetch all users of a tenant' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @Get('tenant/:tenantId/users')
  async queryTenantUsers(
    @Param('tenantId') tenantId: string,
    @Query('q') query?: string,
    @Query('scopes') scopes?: number | number[],
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('size', ParseOptionalIntPipe) size?: number
  ): Promise<PaginatedList<ViewTenantUserDTO>> {
    return this.userService.queryTenantUsers(tenantId, query, { scopes }, { page, size });
  }

  @ApiTags('Tenant Users')
  @ApiOperation({ summary: 'Get tenant user' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'userId', required: true, description: 'User id as uuid' })
  @Get('tenant/:tenantId/user/:userId')
  async getTenantUser(@Param('tenantId') tenantId: string, @Param('userId', ParseUUIDPipe) userId: string): Promise<ViewTenantUserDTO> {
    return this.userService.fetchTenantUser(tenantId, userId);
  }

  @ApiTags('Tenant Users')
  @ApiOperation({ summary: 'Remove user from tenant' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'userId', required: true, description: 'User id as uuid' })
  @Delete('tenant/:tenantId/user/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTenantUser(@Param('tenantId') tenantId: string, @Param('userId', ParseUUIDPipe) userId: string): Promise<void> {
    return this.userService.removeTenantUser(tenantId, userId);
  }

  @ApiTags('Tenant Users')
  @ApiOperation({ summary: 'Update tenant user' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'userId', required: true, description: 'User id as uuid' })
  @Put('tenant/:tenantId/user/:userId')
  async updateTenantUser(
    @Param('tenantId') tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body(new ValidationPipe()) user: UpdateTenantUserDTO
  ): Promise<ViewTenantUserDTO> {
    return this.userService.updateTenantUser(tenantId, userId, user);
  }

  @ApiTags('Tenant Scopes')
  @ApiOperation({ summary: 'Fetch all scopes in a tenant' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @Get('tenant/:tenantId/scopes')
  async queryTenantScopes(
    @Param('tenantId') tenantId: string,
    @Query('q') query?: string,
    @Query('scopes') scopes?: number | number[],
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('size', ParseOptionalIntPipe) size?: number
  ): Promise<PaginatedList<ViewTenantUserDTO>> {
    return this.userService.queryTenantUsers(tenantId, query, { scopes }, { page, size });
  }

  @ApiTags('Tenant Scopes')
  @ApiOperation({ summary: 'Create a new tenant scope' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @Post('tenant/:tenantId/scopes')
  async createTenantScope(@Param('tenantId') tenantId: string, @Body(new ValidationPipe()) scope: CreateScopeDTO): Promise<ViewScopeDTO> {
    return this.scopeService.createScope(tenantId, scope);
  }

  @ApiTags('Tenant Scopes')
  @ApiOperation({ summary: 'Get a single scope' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @Get('tenant/:tenantId/scope/:scopeId')
  async getTenantScope(@Param('tenantId') tenantId: string, @Param('scopeId', ParseIntPipe) scopeId: number): Promise<ViewScopeDTO> {
    return this.scopeService.fetchTenantScope(tenantId, scopeId);
  }

  @ApiTags('Tenant Scopes')
  @ApiOperation({ summary: 'Update tenant scope' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @Put('tenant/:tenantId/scope/:scopeId')
  async updateTenantScope(
    @Param('tenantId') tenantId: string,
    @Param('scopeId', ParseIntPipe) scopeId: number,
    @Body(new ValidationPipe()) scope: UpdateScopeDTO
  ): Promise<ViewScopeDTO> {
    return this.scopeService.updateTenantScope(tenantId, scopeId, scope);
  }

  @ApiTags('Tenant Users')
  @ApiOperation({ summary: 'Create tenant user invites' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @Post('tenant/:tenantId/invites')
  async createTenantUserInvites(
    @Param('tenantId') tenantId: string,
    @Body(new ValidationPipe()) body: CreateTenantInviteDTO
  ): Promise<ViewTenantInviteDTO> {
    return this.userService.createTenantInvite(tenantId, body);
  }

  @ApiTags('Tenant Users')
  @ApiOperation({ summary: 'Get tenant user invites' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @Get('tenant/:tenantId/invites')
  async getTenantUserInvites(@Param('tenantId') tenantId: string): Promise<ViewTenantInviteDTO[]> {
    return this.userService.getTenantInvites(tenantId);
  }

  @ApiTags('Tenant Users')
  @ApiOperation({ summary: 'Get tenant user invite' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'inviteId', required: true, description: 'Tenant invite id as uuid' })
  @Get('tenant/:tenantId/invite/:inviteId')
  async getTenantUserInvite(
    @Param('tenantId') tenantId: string,
    @Param('inviteId', ParseUUIDPipe) inviteId: string
  ): Promise<ViewTenantInviteDTO> {
    return this.userService.getTenantInvite(tenantId, inviteId);
  }

  @ApiTags('Tenant Users')
  @ApiOperation({ summary: 'Delete tenant user invite' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'inviteId', required: true, description: 'Tenant invite id as uuid' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('tenant/:tenantId/invite/:inviteId')
  async deleteTenantUserInvite(@Param('tenantId') tenantId: string, @Param('inviteId', ParseUUIDPipe) inviteId: string): Promise<void> {
    return this.userService.deleteTenantInvite(tenantId, inviteId);
  }

  @ApiTags('Tenant Users')
  @ApiOperation({ summary: 'Accept tenant user invites' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'inviteId', required: true, description: 'Tenant invite id as uuid' })
  @Post('tenant/:tenantId/invite/:inviteId/accept')
  async acceptTenantUserInvites(
    @Param('tenantId') tenantId: string,
    @Param('inviteId', ParseUUIDPipe) inviteId: string,
    @Body(new ValidationPipe()) body: AcceptTenantInviteDTO
  ): Promise<ViewTenantUserDTO> {
    return this.userService.acceptTenantInvite(tenantId, inviteId, body);
  }

  @ApiTags('Tenant Operators')
  @ApiOperation({ summary: 'Confirm tenant operator' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'operatorId', required: true, description: 'Operator id as uuid' })
  @Post('tenant/:tenantId/operator/:operatorId/accept')
  async confirmTenantOperator(
    @Param('tenantId') tenantId: string,
    @Param('operatorId', ParseUUIDPipe) operatorId: string
  ): Promise<ViewOperatorTenantDTO> {
    return this.tenantService.confirmTenantOperator(tenantId, operatorId);
  }

  @ApiTags('Tenant Operators')
  @ApiOperation({ summary: 'Remove tenant operator' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'operatorId', required: true, description: 'Operator id as uuid' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('tenant/:tenantId/operator/:operatorId')
  async removeTenantOperator(@Param('tenantId') tenantId: string, @Param('operatorId', ParseUUIDPipe) operatorId: string): Promise<void> {
    return this.tenantService.removeTenantOperator(tenantId, operatorId);
  }

  @ApiTags('Tenant User Presence')
  @ApiOperation({ summary: 'Set user presence' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'userId', required: true, description: 'User id as uuid' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('tenant/:tenantId/user/:userId/presence')
  async setTenantUserPresence(
    @Param('tenantId') tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Body(new ValidationPipe()) body: SetUserPresenceDTO
  ): Promise<ViewPresenceDTO> {
    return this.userService.setUserPresence(tenantId, userId, body);
  }

  @ApiTags('Tenant User Presence')
  @ApiOperation({ summary: 'Clear user presence' })
  @ApiParam({ name: 'tenantId', required: true, description: 'Tenant id as uuid' })
  @ApiParam({ name: 'userId', required: true, description: 'User id as uuid' })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete('tenant/:tenantId/user/:userId/presence')
  async clearTenantUserPresence(
    @Param('tenantId') tenantId: string,
    @Param('userId', ParseUUIDPipe) userId: string
  ): Promise<ViewPresenceDTO> {
    return this.userService.clearUserPresence(tenantId, userId);
  }
}
