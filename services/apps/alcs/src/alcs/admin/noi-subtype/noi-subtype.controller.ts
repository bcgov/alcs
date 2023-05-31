import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { NoticeOfIntentSubtypeDto } from '../../notice-of-intent/notice-of-intent.dto';
import { NoiSubtypeService } from './noi-subtype.service';

@Controller('noi-subtype')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class NoiSubtypeController {
  constructor(private noiSubtypeService: NoiSubtypeService) {}

  @Get()
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch() {
    return await this.noiSubtypeService.fetch();
  }

  @Patch('/:code')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(
    @Param('code') code: string,
    @Body() updateDto: NoticeOfIntentSubtypeDto,
  ) {
    return await this.noiSubtypeService.update(code, updateDto);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: NoticeOfIntentSubtypeDto) {
    return await this.noiSubtypeService.create(createDto);
  }
}
