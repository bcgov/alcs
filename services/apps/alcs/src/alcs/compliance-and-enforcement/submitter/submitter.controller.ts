import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { AUTH_ROLE, ROLES_ALLOWED_APPLICATIONS } from '../../../common/authorization/roles';
import { ComplianceAndEnforcementSubmitterService } from './submitter.service';
import { ComplianceAndEnforcementSubmitterDto, UpdateComplianceAndEnforcementSubmitterDto } from './submitter.dto';
import { DeleteResult } from 'typeorm';

@Controller('compliance-and-enforcement/submitter')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ComplianceAndEnforcementSubmitterController {
  constructor(private service: ComplianceAndEnforcementSubmitterService) {}

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async create(
    @Body() createDto: UpdateComplianceAndEnforcementSubmitterDto,
  ): Promise<ComplianceAndEnforcementSubmitterDto> {
    return await this.service.create(createDto);
  }

  @Patch('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateComplianceAndEnforcementSubmitterDto,
  ): Promise<ComplianceAndEnforcementSubmitterDto> {
    return await this.service.update(uuid, updateDto);
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async delete(@Param('uuid') uuid: string): Promise<DeleteResult> {
    return await this.service.delete(uuid);
  }
}
