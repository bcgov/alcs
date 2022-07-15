import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { CreateOrUpdateUserDto } from './user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  getUsers() {
    return this.userService.listUsers();
  }

  @Post()
  createUser(@Body() dto: CreateOrUpdateUserDto) {
    return this.userService.createUser(dto);
  }

  @Post('/roles')
  setUserRoles(@Body() dto: CreateOrUpdateUserDto) {
    return this.userService.setUserRoles(dto.email, dto.roles);
  }

  @Delete()
  deleteUser(@Body() email: string) {
    return this.userService.deleteUser(email);
  }
}
