import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Put, Query, Scope, UseGuards, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ParseOptionalIntPipe } from '@nestjs-snerpa/common';
import { AuthGuard, RoleGuard, RequestUser, KeycloakTokenClaims } from '@nestjs-snerpa/keycloak';

import { AppRole, UpdateUserDTO, ViewUserDTO } from '@vidvera/core';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller({ scope: Scope.REQUEST })
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @ApiOperation({
    summary: 'Get logged in user profile'
  })
  @ApiParam({
    name: 'id',
    description: 'User ID, use "me" to get the current user',
    example: 'me'
  })
  @Get('/user/:id/profile')
  async profile(@Param('id') id: string, @RequestUser() requestUser: KeycloakTokenClaims) {
    return this.userService.getUserProfile(id === 'me' ? requestUser.sub : id);
  }

  @ApiOperation({ summary: 'Fetch all users' })
  @ApiQuery({ name: 'page', example: 0, description: 'Page number', required: false })
  @ApiQuery({ name: 'size', example: 25, description: 'Page size', required: false })
  @ApiQuery({ name: 'name', example: 'snerpa', description: 'User name', required: false })
  @ApiQuery({ name: 'email', example: 'john@asdf.is', description: 'User email', required: false })
  @ApiQuery({ name: 'tenant', required: false, description: 'Tenant id or name' })
  @UseGuards(RoleGuard(AppRole.Superuser))
  @Get('users')
  async fetchUsers(
    @Query('page', ParseOptionalIntPipe) page?: number,
    @Query('size', ParseOptionalIntPipe) size?: number,
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('tenant') tenant?: string
  ) {
    return this.userService.fetchUsers({ name, email, tenant }, { page, size });
  }

  @ApiOperation({ summary: 'Fetch a user by id' })
  @ApiParam({ name: 'id', required: true, description: 'User id as uuid' })
  @ApiOkResponse({ type: ViewUserDTO })
  @ApiNotFoundResponse({ description: 'User not found' })
  @Get('user/:id')
  async fetchUser(@Param('id', ParseUUIDPipe) id: string): Promise<ViewUserDTO> {
    return this.userService.fetchUser(id);
  }

  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', required: true, description: 'User id as uuid' })
  @ApiBody({ type: UpdateUserDTO })
  @ApiOkResponse({ type: ViewUserDTO })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseGuards(RoleGuard(AppRole.Superuser))
  @Put('user/:id')
  async updateUser(@Param('id', ParseUUIDPipe) id: string, @Body(new ValidationPipe()) user: UpdateUserDTO): Promise<ViewUserDTO> {
    return this.userService.updateUser(id, user);
  }

  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', required: true, description: 'User id as uuid' })
  @ApiOkResponse({ description: 'User deleted' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @UseGuards(RoleGuard(AppRole.Superuser))
  @Delete('user/:id')
  async deleteUser(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.userService.deleteUser(id);
  }
}
