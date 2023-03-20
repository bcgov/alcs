import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ApplicationLocalGovernmentService } from '../../application/application-code/application-local-government/application-local-government.service';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  LocalGovernmentCreateDto,
  LocalGovernmentUpdateDto,
} from './local-government.dto';

@Controller('admin-local-government')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class LocalGovernmentController {
  constructor(
    private localGovernmentService: ApplicationLocalGovernmentService,
  ) {}

  @Get('/:pageIndex/:itemsPerPage')
  @UserRoles(AUTH_ROLE.ADMIN)
  async fetch(
    @Param('pageIndex') pageIndex: number,
    @Param('itemsPerPage') itemsPerPage: number,
    @Query('search') search?: string,
  ) {
    const result = await this.localGovernmentService.fetch(
      pageIndex,
      itemsPerPage,
      search,
    );

    const mappedGovernments = result[0].map((government) => ({
      name: government.name,
      preferredRegionCode: government.preferredRegion.code,
      uuid: government.uuid,
      bceidBusinessGuid: government.bceidBusinessGuid,
      isFirstNation: government.isFirstNation,
      isActive: government.isActive,
    }));

    return { data: mappedGovernments, total: result[1] };
  }

  @Put('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: LocalGovernmentUpdateDto,
  ) {
    return await this.localGovernmentService.update(uuid, updateDto);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN)
  async create(@Body() createDto: LocalGovernmentCreateDto) {
    return await this.localGovernmentService.create(createDto);
  }
}
