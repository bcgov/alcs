import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  Body,
  Controller,
  Delete,
  Get,
  MethodNotAllowedException,
  NotFoundException,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../common/authorization/role.guard';
import { ANY_AUTH_ROLE, AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { CreateOrUpdateUserDto, UserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('user')
@UseGuards(RoleGuard)
export class UserController {
  constructor(
    private userService: UserService,
    @InjectMapper() private userMapper: Mapper,
  ) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getUsers() {
    const users = await this.userService.listUsers();
    return this.userMapper.mapArrayAsync(users, User, UserDto);
  }

  @Delete()
  @UserRoles(AUTH_ROLE.ADMIN)
  deleteUser(@Body() email: string) {
    return this.userService.deleteUser(email);
  }

  @Patch()
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(@Body() user: CreateOrUpdateUserDto, @Req() req) {
    const existingUser = await this.userService.getUser(user.email);

    if (!existingUser) {
      throw new NotFoundException(
        `User with provided email not found ${user.email}`,
      );
    }

    if (user.uuid !== req.user.entity.uuid) {
      throw new MethodNotAllowedException(
        'You can update only your user details.',
      );
    }

    const userEntity = await this.userMapper.mapAsync(
      user,
      CreateOrUpdateUserDto,
      User,
    );
    return this.userService.update(userEntity);
  }
}
