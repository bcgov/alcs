import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { HolidayCreateDto, HolidayUpdateDto } from './holiday.dto';
import { HolidayService } from './holiday.service';

@Controller('stat-holiday')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class HolidayController {
  constructor(private holidayService: HolidayService) {}

  @Get('/:pageIndex/:itemsPerPage')
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch(
    @Param('pageIndex') pageIndex: number,
    @Param('itemsPerPage') itemsPerPage: number,
    @Query('search') search?: number,
  ) {
    const result = await this.holidayService.fetch(
      pageIndex,
      itemsPerPage,
      search,
    );
    return { data: result[0], total: result[1] };
  }

  @Get('/filters')
  @UserRoles(AUTH_ROLE.ADMIN)
  async getFilterValues() {
    const years = await this.holidayService.fetchAllYears();
    return {
      years,
    };
  }

  @Put('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: HolidayUpdateDto,
  ) {
    return await this.holidayService.update(uuid, updateDto);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: HolidayCreateDto) {
    return await this.holidayService.create(createDto);
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN)
  async delete(@Param('uuid') uuid: string) {
    return await this.holidayService.delete(uuid);
  }
}
