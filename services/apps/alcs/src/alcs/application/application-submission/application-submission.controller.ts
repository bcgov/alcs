import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { DocumentService } from '../../../document/document.service';
import { ApplicationSubmissionService } from './application-submission.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('application-submission')
export class ApplicationSubmissionController {
  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private documentService: DocumentService,
  ) {}

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string) {
    const submission = await this.applicationSubmissionService.get(fileNumber);

    return await this.applicationSubmissionService.mapToDto(submission);
  }

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/document/:uuid/open')
  async downloadFile(@Param(':uuid') uuid: string) {
    const document = await this.documentService.getDocument(uuid);
    const url = await this.documentService.getDownloadUrl(document, true);
    return { url };
  }
}
