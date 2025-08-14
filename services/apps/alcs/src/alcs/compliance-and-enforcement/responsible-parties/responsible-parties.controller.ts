import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { ComplianceAndEnforcementResponsiblePartyService } from './responsible-parties.service';
import {
  ComplianceAndEnforcementResponsiblePartyDto,
  CreateComplianceAndEnforcementResponsiblePartyDto,
  UpdateComplianceAndEnforcementResponsiblePartyDto,
} from './responsible-parties.dto';
import { DeleteResult } from 'typeorm';

@Controller('compliance-and-enforcement/responsible-parties')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ComplianceAndEnforcementResponsiblePartyController {
  constructor(private service: ComplianceAndEnforcementResponsiblePartyService) {}

  @Get('/file/:id')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async fetchByFileId(
    @Param('id') id: string,
    @Query('idType') idType: string,
  ): Promise<ComplianceAndEnforcementResponsiblePartyDto[]> {
    if (idType === 'fileNumber') {
      return await this.service.fetchByFileNumber(id);
    } else {
      return await this.service.fetchByFileUuid(id);
    }
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async create(
    @Body() createDto: CreateComplianceAndEnforcementResponsiblePartyDto,
  ): Promise<ComplianceAndEnforcementResponsiblePartyDto> {
    return await this.service.create(createDto);
  }

  @Patch('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateComplianceAndEnforcementResponsiblePartyDto,
  ): Promise<ComplianceAndEnforcementResponsiblePartyDto> {
    return await this.service.update(uuid, updateDto);
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async delete(@Param('uuid') uuid: string): Promise<DeleteResult> {
    return await this.service.delete(uuid);
  }
}
