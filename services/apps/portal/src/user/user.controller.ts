import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AuthGuard } from '../common/authorization/auth-guard.service';
import { UserDto } from './user.dto';
import { User } from './user.entity';
import { UserService } from './user.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@Controller('user')
@UseGuards(AuthGuard)
export class UserController {
  constructor(
    private userService: UserService,
    @InjectMapper() private userMapper: Mapper,
  ) {}

  @Get('/profile')
  async getMyself(@Req() req) {
    const user = req.user.entity;
    return this.userMapper.mapAsync(user, User, UserDto);
  }
}
