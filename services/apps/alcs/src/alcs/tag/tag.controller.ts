import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { TagService } from './tag.service';
import { AUTH_ROLE } from '../../common/authorization/roles';
import { TagDto } from './tag.dto';
import { QueryFailedError } from 'typeorm';

@Controller('tag')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class TagController {
  constructor(private service: TagService) {}

  @Get('/:pageIndex/:itemsPerPage')
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch(
    @Param('pageIndex') pageIndex: number,
    @Param('itemsPerPage') itemsPerPage: number,
    @Query('search') search?: string,
  ) {
    const result = await this.service.fetch(pageIndex, itemsPerPage, search);
    return { data: result[0], total: result[1] };
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: TagDto) {
    try {
      return await this.service.create(createDto);
    } catch (e) {
      if (e.constructor === QueryFailedError) {
        const msg = (e as QueryFailedError).message;
        throw new HttpException(msg, HttpStatus.CONFLICT);
      } else {
        throw e;
      }
    }
  }

  @Patch('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(@Param('uuid') uuid: string, @Body() updateDto: TagDto) {
    try {
      return await this.service.update(uuid, updateDto);
    } catch (e) {
      if (e.constructor === QueryFailedError) {
        const msg = (e as QueryFailedError).message;
        throw new HttpException(msg, HttpStatus.CONFLICT);
      } else {
        throw e;
      }
    }
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN)
  async delete(@Param('uuid') uuid: string) {
    try {
      return await this.service.delete(uuid);
    } catch (e) {
      if (e.constructor === QueryFailedError) {
        const msg = (e as QueryFailedError).message;
        throw new HttpException(msg, HttpStatus.CONFLICT);
      } else {
        throw e;
      }
    }
  }
}
