import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import * as config from 'config';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { SUBMISSION_STATUS } from '../../../application-submission-status/submission-status.dto';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { DocumentService } from '../../../document/document.service';
import { AlcsApplicationSubmissionUpdateDto } from './application-submission.dto';
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
  async downloadFile(@Param('uuid') uuid: string) {
    const document = await this.documentService.getDocument(uuid);
    const url = await this.documentService.getDownloadUrl(document, true);
    return { url };
  }

  @UserRoles(...ANY_AUTH_ROLE)
  @Patch('/:fileNumber/update-status')
  async updateStatus(
    @Param('fileNumber') fileNumber: string,
    @Body('statusCode') status: string,
  ) {
    if (!fileNumber) {
      throw new ServiceValidationException('File number is required');
    }
    await this.applicationSubmissionService.updateStatus(
      fileNumber,
      status as SUBMISSION_STATUS,
    );
    return this.get(fileNumber);
  }

  @UserRoles(...ANY_AUTH_ROLE)
  @Patch('/:fileNumber')
  async updateSubmission(
    @Param('fileNumber') fileNumber: string,
    @Body() updateDto: AlcsApplicationSubmissionUpdateDto,
  ) {
    if (!fileNumber) {
      throw new ServiceValidationException('File number is required');
    }
    await this.applicationSubmissionService.update(fileNumber, updateDto);
    return this.get(fileNumber);
  }
}
