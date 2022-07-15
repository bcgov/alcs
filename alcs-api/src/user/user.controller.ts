import { Body, Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import { RoleGuard } from '../common/authorization/role.guard';
import { UserRoles } from '../common/authorization/roles.decorator';
import { AUTH_ROLE } from '../common/enum';
import { CreateOrUpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(RoleGuard)
  @UserRoles(AUTH_ROLE.ADMIN)
  getUsers() {
    return this.userService.listUsers();
  }

  @Post()
  @UseGuards(RoleGuard)
  @UserRoles(AUTH_ROLE.ADMIN)
  createUser(@Body() dto: CreateOrUpdateUserDto) {
    return this.userService.createUser(dto);
  }

  @Post('/roles')
  @UseGuards(RoleGuard)
  @UserRoles(AUTH_ROLE.ADMIN)
  setUserRoles(@Body() dto: CreateOrUpdateUserDto) {
    return this.userService.setUserRoles(dto.email, dto.roles);
  }

  @Delete()
  @UseGuards(RoleGuard)
  @UserRoles(AUTH_ROLE.ADMIN)
  deleteUser(@Body() email: string) {
    return this.userService.deleteUser(email);
  }
}
