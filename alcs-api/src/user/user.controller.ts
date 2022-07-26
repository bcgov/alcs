import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RoleGuard } from '../common/authorization/role.guard';
import { UserRoles } from '../common/authorization/roles.decorator';
import { AUTH_ROLE } from '../common/enum';
import { CreateOrUpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.listUsers();
  }

  @Post()
  @UseGuards(RoleGuard)
  @UserRoles(AUTH_ROLE.ADMIN)
  createUser(@Body() dto: CreateOrUpdateUserDto) {
    return this.userService.createUser(dto);
  }

  @Delete()
  @UseGuards(RoleGuard)
  @UserRoles(AUTH_ROLE.ADMIN)
  deleteUser(@Body() email: string) {
    return this.userService.deleteUser(email);
  }
}
