import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { AUTH_ROLE, ROLES_ALLOWED_APPLICATIONS } from '../../../common/authorization/roles';
import { ComplianceAndEnforcementPropertyService } from './property.service';
import { ComplianceAndEnforcementPropertyDto, UpdateComplianceAndEnforcementPropertyDto } from './property.dto';
import { DeleteResult } from 'typeorm';

@Controller('compliance-and-enforcement/property')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ComplianceAndEnforcementPropertyController {
  constructor(private service: ComplianceAndEnforcementPropertyService) {}

  @Get('/:fileUuid')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async fetchParcels(@Param('fileNumber') fileNumber: string): Promise<ComplianceAndEnforcementPropertyDto[]> {
    return await this.service.fetchParcels(fileNumber);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async create(
    @Body() createDto: UpdateComplianceAndEnforcementPropertyDto,
  ): Promise<ComplianceAndEnforcementPropertyDto> {
    return await this.service.create(createDto);
  }

  @Patch('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateComplianceAndEnforcementPropertyDto,
  ): Promise<ComplianceAndEnforcementPropertyDto> {
    return await this.service.update(uuid, updateDto);
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async delete(@Param('uuid') uuid: string): Promise<DeleteResult> {
    return await this.service.delete(uuid);
  }
}
