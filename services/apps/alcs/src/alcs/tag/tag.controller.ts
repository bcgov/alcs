import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { TagService } from './tag.service';
import { ANY_AUTH_ROLE, ANY_ROLE_BUT_COMMISSIONER, AUTH_ROLE } from '../../common/authorization/roles';
import { TagDto } from './tag.dto';

@Controller('tag')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class TagController {
  constructor(private service: TagService) {}

  @Get('')
  @UserRoles(...ANY_AUTH_ROLE)
  async fetch(
    @Query('pageIndex') pageIndex: number,
    @Query('itemsPerPage') itemsPerPage: number,
    @Query('search') search?: string,
  ) {
    const result = await this.service.fetch(pageIndex, itemsPerPage, search);
    return { data: result[0], total: result[1] };
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: TagDto) {
    return await this.service.create(createDto);
  }

  @Patch('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(@Param('uuid') uuid: string, @Body() updateDto: TagDto) {
    return await this.service.update(uuid, updateDto);
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN)
  async delete(@Param('uuid') uuid: string) {
    return await this.service.delete(uuid);
  }
}
