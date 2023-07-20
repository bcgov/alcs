import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  MethodNotAllowedException,
  NotFoundException,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE, AUTH_ROLE } from '../common/authorization/roles';
import { RolesGuard } from '../common/authorization/roles-guard.service';
import { UserRoles } from '../common/authorization/roles.decorator';
import { AssigneeDto, UpdateUserDto, UserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('user')
@UseGuards(RolesGuard)
export class UserController {
  constructor(
    private userService: UserService,
    @InjectMapper() private userMapper: Mapper,
  ) {}

  @Get('/profile')
  @UserRoles()
  async getMyself(@Req() req) {
    const user = req.user.entity;
    const mappedUser = await this.userMapper.mapAsync(user, User, UserDto);
    const government = await this.userService.getUserLocalGovernment(user);
    mappedUser.government = government ? government.name : undefined;
    return mappedUser;
  }

  @Get('/assignable')
  @UserRoles(...ANY_AUTH_ROLE)
  async getAssignableUsers() {
    const users = await this.userService.getAssignableUsers();
    return this.userMapper.mapArrayAsync(users, User, AssigneeDto);
  }

  @Delete()
  @UserRoles(AUTH_ROLE.ADMIN)
  async deleteUser(@Body() uuid: string) {
    const deleted = await this.userService.delete(uuid);
    return this.userMapper.mapAsync(deleted, User, UserDto);
  }

  @Patch('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') userUuid: string,
    @Body() updateDto: UpdateUserDto,
    @Req() req,
  ) {
    if (userUuid !== req.user.entity.uuid) {
      throw new MethodNotAllowedException(
        'You can update only your user details.',
      );
    }

    const existingUser = await this.userService.getByUuid(userUuid);
    if (!existingUser) {
      throw new NotFoundException(`User with uuid not found ${userUuid}`);
    }

    return this.userService.update(userUuid, updateDto);
  }
}
