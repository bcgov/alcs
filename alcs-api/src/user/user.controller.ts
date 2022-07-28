import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Body, Controller, Delete, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../common/authorization/role.guard';
import { UserRoles } from '../common/authorization/roles.decorator';
import { ANY_AUTH_ROLE, AUTH_ROLE } from '../common/enum';
import { UserDto } from './user.dto';
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
}
