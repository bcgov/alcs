import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { AUTH_ROLE } from '../../../common/authorization/roles';
import { ComplianceAndEnforcementDocumentService } from './document.service';
import { ComplianceAndEnforcementDocumentDto, UpdateComplianceAndEnforcementDocumentDto } from './document.dto';
import { DeleteResult } from 'typeorm';
import { CreateDocumentDto, DOCUMENT_SOURCE, DOCUMENT_SYSTEM, DocumentTypeDto } from '../../../document/document.dto';
import { User } from '../../../user/user.entity';
import { v4 } from 'uuid';

@Controller('compliance-and-enforcement/document')
@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
export class ComplianceAndEnforcementDocumentController {
  constructor(private service: ComplianceAndEnforcementDocumentService) {}

  @Get('')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async list(
    @Query('fileNumber') fileNumber?: string,
    @Query('typeCodes') typeCodes?: string[],
  ): Promise<ComplianceAndEnforcementDocumentDto[]> {
    return await this.service.list(fileNumber, typeCodes);
  }

  @Post('/:fileNumber')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async create(@Param('fileNumber') fileNumber: string, @Req() req): Promise<ComplianceAndEnforcementDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    const dto: CreateDocumentDto = {
      typeCode: req.body.documentType.value,
      mimeType: req.body.file.mimeType,
      fileName: req.body.fileName.value,
      fileKey: `compliance-and-enforcement/${fileNumber}/${v4()}`,
      source: req.body.source.value as DOCUMENT_SOURCE,
      system: DOCUMENT_SYSTEM.ALCS,
    };

    return await this.service.create(fileNumber, req.user.entity as User, req.body.file, dto);
  }

  @Patch('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async update(
    @Param('uuid') uuid: string,
    @Body() updateDto: UpdateComplianceAndEnforcementDocumentDto,
  ): Promise<ComplianceAndEnforcementDocumentDto> {
    return await this.service.update(uuid, updateDto);
  }

  @Delete('/:uuid')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async delete(@Param('uuid') uuid: string): Promise<DeleteResult> {
    return await this.service.delete(uuid);
  }

  @Get('/types')
  @UserRoles(AUTH_ROLE.ADMIN, AUTH_ROLE.C_AND_E)
  async getDocumentTypes(@Query('allowedCodes') allowedCodes?: string[]): Promise<DocumentTypeDto[]> {
    if (allowedCodes && !Array.isArray(allowedCodes)) {
      allowedCodes = [allowedCodes];
    }

    return await this.service.fetchTypes(allowedCodes);
  }
}
