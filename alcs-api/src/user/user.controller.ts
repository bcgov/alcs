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
import { RolesGuard } from '../common/authorization/roles-guard.service';
import { ANY_AUTH_ROLE, AUTH_ROLE } from '../common/authorization/roles';
import { UserRoles } from '../common/authorization/roles.decorator';
import { UpdateUserDto, UserDto } from './user.dto';
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

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  async getUsers() {
    const users = await this.userService.getAll();
    return this.userMapper.mapArrayAsync(users, User, UserDto);
  }

  @Delete()
  @UserRoles(AUTH_ROLE.ADMIN)
  async deleteUser(@Body() uuid: string) {
    const deleted = await this.userService.delete(uuid);
    return this.userMapper.mapAsync(deleted, User, UserDto);
  }

  @Patch(':/uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async update(
    @Param('uuid') userUuid: string,
    @Body() user: UpdateUserDto,
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

    const userEntity = await this.userMapper.mapAsync(
      user,
      UpdateUserDto,
      User,
    );
    return this.userService.update(userEntity.uuid, userEntity);
  }
}
