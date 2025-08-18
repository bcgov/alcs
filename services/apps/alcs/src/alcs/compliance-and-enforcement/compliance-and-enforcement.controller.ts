import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { AUTH_ROLE, ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { ComplianceAndEnforcementService } from './compliance-and-enforcement.service';
import { ComplianceAndEnforcementDto, UpdateComplianceAndEnforcementDto } from './compliance-and-enforcement.dto';
import { DeleteResult } from 'typeorm';

@Controller('compliance-and-enforcement')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ComplianceAndEnforcementController {
  constructor(private service: ComplianceAndEnforcementService) {}

  @Get('')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async fetchAll(): Promise<ComplianceAndEnforcementDto[]> {
    return await this.service.fetchAll();
  }

  @Get('/:fileNumber')
  @UserRoles(...ROLES_ALLOWED_APPLICATIONS)
  async fetchByFileNumber(
    @Param('fileNumber') fileNumber: string,
    @Query('withSubmitters', ParseBoolPipe) withSubmitters: boolean = false,
    @Query('withProperty', ParseBoolPipe) withProperty: boolean = false,
  ): Promise<ComplianceAndEnforcementDto> {
    return await this.service.fetchByFileNumber(fileNumber, withSubmitters, withProperty);
  }

  @Post('')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async create(
    @Body() createDto: UpdateComplianceAndEnforcementDto,
    @Query('createInitialSubmitter') createInitialSubmitter: boolean = false,
    @Query('createInitialProperty') createInitialProperty: boolean = false,
  ): Promise<ComplianceAndEnforcementDto> {
    return await this.service.create(createDto, createInitialSubmitter, createInitialProperty);
  }

  @Patch('/:id')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateComplianceAndEnforcementDto,
    @Query('idType') idType: string = 'uuid',
  ): Promise<ComplianceAndEnforcementDto> {
    return await this.service.update(id, updateDto, { idType });
  }

  @Post('/:id/submit')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async submit(@Param('id') id: string): Promise<ComplianceAndEnforcementDto> {
    return await this.service.submit(id);
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async delete(@Param('uuid') uuid: string): Promise<DeleteResult> {
    return await this.service.delete(uuid);
  }
}
