import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { FastifyReply } from 'fastify';
import { RoleGuard } from '../../common/authorization/role.guard';
import { ANY_AUTH_ROLE } from '../../common/authorization/roles';
import { UserRoles } from '../../common/authorization/roles.decorator';
import { ApplicationDocumentDto } from './application-document.dto';
import {
  ApplicationDocument,
  DOCUMENT_TYPE,
  DOCUMENT_TYPES,
} from './application-document.entity';
import { ApplicationDocumentService } from './application-document.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RoleGuard)
@Controller('application-document')
export class ApplicationDocumentController {
  constructor(
    private applicationDocumentService: ApplicationDocumentService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @Post('/application/:fileNumber/:documentType')
  @UserRoles(...ANY_AUTH_ROLE)
  async attachDocument(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: string,
    @Req() req,
  ): Promise<ApplicationDocumentDto> {
    if (!req.isMultipart()) {
      throw new BadRequestException('Request is not multipart');
    }

    if (!DOCUMENT_TYPES.includes(documentType as DOCUMENT_TYPE)) {
      throw new BadRequestException(
        `Invalid document type specified, must be one of ${DOCUMENT_TYPES.join(
          ', ',
        )}`,
      );
    }

    const file = await req.file();
    const savedDocument = await this.applicationDocumentService.attachDocument(
      fileNumber,
      file,
      req.user.entity,
      documentType as DOCUMENT_TYPE,
    );
    return this.mapper.map(
      savedDocument,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Get('/application/:fileNumber/:documentType')
  @UserRoles(...ANY_AUTH_ROLE)
  async listDocuments(
    @Param('fileNumber') fileNumber: string,
    @Param('documentType') documentType: DOCUMENT_TYPE,
  ): Promise<ApplicationDocumentDto[]> {
    if (!DOCUMENT_TYPES.includes(documentType)) {
      throw new BadRequestException(
        `Invalid document type specified, must be one of decisionDocument`,
      );
    }

    const documents = await this.applicationDocumentService.list(
      fileNumber,
      documentType as DOCUMENT_TYPE,
    );
    return this.mapper.mapArray(
      documents,
      ApplicationDocument,
      ApplicationDocumentDto,
    );
  }

  @Get('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async download(@Param('uuid') fileUuid: string) {
    const document = await this.applicationDocumentService.get(fileUuid);
    const url = await this.applicationDocumentService.getDownloadUrl(document);
    return {
      url,
    };
  }

  @Delete('/:uuid')
  @UserRoles(...ANY_AUTH_ROLE)
  async delete(@Param('uuid') fileUuid: string) {
    const document = await this.applicationDocumentService.get(fileUuid);
    await this.applicationDocumentService.delete(document);
    return { deleted: true };
  }
}
