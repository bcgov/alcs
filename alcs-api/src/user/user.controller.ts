import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../common/authorization/role.guard';
import { UserRoles } from '../common/authorization/roles.decorator';
import { ANY_AUTH_ROLE, AUTH_ROLE } from '../common/enum';
import { CreateOrUpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('user')
@UseGuards(RoleGuard)
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UserRoles(...ANY_AUTH_ROLE)
  getUsers() {
    return this.userService.listUsers();
  }

  @Post()
  @UserRoles(AUTH_ROLE.ADMIN)
  createUser(@Body() dto: CreateOrUpdateUserDto) {
    return this.userService.createUser(dto);
  }

  @Delete()
  @UserRoles(AUTH_ROLE.ADMIN)
  deleteUser(@Body() email: string) {
    return this.userService.deleteUser(email);
  }
}
