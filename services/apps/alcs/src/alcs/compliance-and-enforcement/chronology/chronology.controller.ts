import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from './chronology.dto';
import { ComplianceAndEnforcementChronologyService, EntryOptions } from './chronology.service';

@Controller('compliance-and-enforcement/chronology')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ComplianceAndEnforcementChronologyController {
  constructor(private readonly service: ComplianceAndEnforcementChronologyService) {}

  @Get('/entry')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async list(
    @Query('filterByUuid') filterByUuid?: string,
    @Query('filterByFileUuid') filterByFileUuid?: string,
    @Query('filterByFileNumber') filterByFileNumber?: string,
  ): Promise<ComplianceAndEnforcementChronologyEntryDto[]> {
    const options: EntryOptions = {};

    if (filterByUuid) {
      options.filterByUuid = filterByUuid;
    }

    if (filterByFileUuid) {
      options.filterByFileUuid = filterByFileUuid;
    }

    if (filterByFileNumber) {
      options.filterByFileNumber = filterByFileNumber;
    }

    return await this.service.entries(options);
  }

  @Get('/entry/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async getByUuid(@Param('uuid') uuid: string): Promise<ComplianceAndEnforcementChronologyEntryDto> {
    return await this.service.entry(uuid);
  }

  @Post('/entry')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async create(
    @Body() createDto: UpdateComplianceAndEnforcementChronologyEntryDto,
  ): Promise<ComplianceAndEnforcementChronologyEntryDto> {
    return await this.service.createEntry(createDto);
  }

  @Patch('/entry/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateComplianceAndEnforcementChronologyEntryDto,
  ): Promise<ComplianceAndEnforcementChronologyEntryDto> {
    return await this.service.updateEntry(uuid, updateDto);
  }

  @Delete('/entry/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async delete(@Param('uuid') uuid: string): Promise<{ uuid: string }> {
    await this.service.deleteEntry(uuid);

    return { uuid };
  }
}
