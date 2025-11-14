import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { ComplianceAndEnforcementChronologyService } from './chronology.service';
import {
  ComplianceAndEnforcementChronologyEntryDto,
  UpdateComplianceAndEnforcementChronologyEntryDto,
} from './chronology.dto';
import { DeleteResult } from 'typeorm';

@Controller('compliance-and-enforcement/chronology')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ComplianceAndEnforcementChronologyController {
  constructor(private readonly service: ComplianceAndEnforcementChronologyService) {}

  @Get('/entry')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async listByFileId(
    @Query('fileId') fileId: string,
    @Query('idType') idType: string,
  ): Promise<ComplianceAndEnforcementChronologyEntryDto[]> {
    return await this.service.entriesByFileId(fileId, { idType });
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
  async delete(@Param('uuid') uuid: string): Promise<DeleteResult> {
    return await this.service.deleteEntry(uuid);
  }
}
