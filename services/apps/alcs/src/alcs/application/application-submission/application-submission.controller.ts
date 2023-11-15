import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2 } from '@nestjs/swagger';
import { Mapper } from 'automapper-core';
import { InjectMapper } from 'automapper-nestjs';
import * as config from 'config';
import { ServiceValidationException } from '../../../../../../libs/common/src/exceptions/base.exception';
import { generateINCGApplicationHtml } from '../../../../../../templates/emails/return-to-lfng';
import { ANY_AUTH_ROLE } from '../../../common/authorization/roles';
import { RolesGuard } from '../../../common/authorization/roles-guard.service';
import { UserRoles } from '../../../common/authorization/roles.decorator';
import { DocumentService } from '../../../document/document.service';
import { CovenantTransfereeDto } from '../../../portal/application-submission/covenant-transferee/covenant-transferee.dto';
import { CovenantTransferee } from '../../../portal/application-submission/covenant-transferee/covenant-transferee.entity';
import { StatusEmailService } from '../../../providers/email/status-email.service';
import { PARENT_TYPE } from '../../card/card-subtask/card-subtask.dto';
import { ApplicationSubmissionStatusService } from '../application-submission-status/application-submission-status.service';
import { SUBMISSION_STATUS } from '../application-submission-status/submission-status.dto';
import { AlcsApplicationSubmissionUpdateDto } from './application-submission.dto';
import { ApplicationSubmissionService } from './application-submission.service';

@ApiOAuth2(config.get<string[]>('KEYCLOAK.SCOPES'))
@UseGuards(RolesGuard)
@Controller('application-submission')
export class ApplicationSubmissionController {
  constructor(
    private applicationSubmissionService: ApplicationSubmissionService,
    private applicationSubmissionStatusService: ApplicationSubmissionStatusService,
    private documentService: DocumentService,
    private statusEmailService: StatusEmailService,
    @InjectMapper() private mapper: Mapper,
  ) {}

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/:fileNumber')
  async get(@Param('fileNumber') fileNumber: string) {
    const submission = await this.applicationSubmissionService.get(fileNumber);

    return await this.applicationSubmissionService.mapToDto(submission);
  }

  @UserRoles(...ANY_AUTH_ROLE)
  @Get('/:fileNumber/transferee')
  async getCovenantTransferees(@Param('fileNumber') fileNumber: string) {
    const covenantTransferees =
      await this.applicationSubmissionService.getTransferees(fileNumber);

    return this.mapper.mapArray(
      covenantTransferees,
      CovenantTransferee,
      CovenantTransfereeDto,
    );
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

  @UserRoles(...ANY_AUTH_ROLE)
  @Post('/:fileNumber/return')
  async returnToLfng(
    @Param('fileNumber') fileNumber: string,
    @Body() dto: AlcsApplicationSubmissionUpdateDto,
  ) {
    //Set Comment
    await this.applicationSubmissionService.update(fileNumber, {
      returnComment: dto.returnComment,
    });

    const submission = await this.applicationSubmissionService.get(fileNumber);

    //Set Status
    await this.applicationSubmissionStatusService.setStatusDate(
      submission.uuid,
      SUBMISSION_STATUS.RETURNED_TO_LG,
    );

    //Clear Other Statuses
    await this.applicationSubmissionStatusService.setStatusDate(
      submission.uuid,
      SUBMISSION_STATUS.SUBMITTED_TO_ALC,
      null,
    );
    await this.applicationSubmissionStatusService.setStatusDate(
      submission.uuid,
      SUBMISSION_STATUS.REFUSED_TO_FORWARD_LG,
      null,
    );

    const { primaryContact, submissionGovernment } =
      await this.statusEmailService.getApplicationEmailData(
        submission.fileNumber,
        submission,
      );

    //Send Email
    if (primaryContact && submissionGovernment) {
      await this.statusEmailService.sendApplicationStatusEmail({
        generateStatusHtml: generateINCGApplicationHtml,
        status: SUBMISSION_STATUS.RETURNED_TO_LG,
        applicationSubmission: submission,
        government: submissionGovernment,
        parentType: PARENT_TYPE.APPLICATION,
        primaryContact,
        ccGovernment: true,
      });
    }

    //Return Updated Version
    return this.get(fileNumber);
  }
}
