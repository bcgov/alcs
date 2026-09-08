import { Body, Controller, Delete, Get, Param, ParseBoolPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { DeleteResult } from 'typeorm';
import { AUTH_ROLE, ROLES_ALLOWED_APPLICATIONS } from '../../common/authorization/roles';
import { RolesGuard } from '../../common/authorization/roles-guard.service';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ComplianceAndEnforcementDto, UpdateComplianceAndEnforcementDto } from './compliance-and-enforcement.dto';
import { ComplianceAndEnforcementService, Status } from './compliance-and-enforcement.service';

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
    @Query('withAssignee', ParseBoolPipe) withAssignee: boolean = false,
  ): Promise<ComplianceAndEnforcementDto> {
    return await this.service.fetchById(fileNumber, 'fileNumber', withSubmitters, withProperty, withAssignee);
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

  @Patch('/:id/status')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async setStatus(
    @Param('id') id: string,
    @Body() status: Status,
    @Query('idType') idType: string = 'uuid',
  ): Promise<ComplianceAndEnforcementDto> {
    return await this.service.setStatus(id, status, { idType });
  }

  @Patch('/:id/file-path')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async setFilePath(
    @Param('id') id: string,
    @Body() filePath: { filePath: string },
    @Query('idType') idType: string = 'uuid',
  ): Promise<ComplianceAndEnforcementDto> {
    return await this.service.setFilePath(id, filePath.filePath, { idType });
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

  @Get('/:fileNumber/uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async uuidByFileNumber(@Param('fileNumber') fileNumber: string): Promise<{ uuid: string }> {
    const uuid = await this.service.uuidByFileNumber(fileNumber);

    return { uuid };
  }
}
